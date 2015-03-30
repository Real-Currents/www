package Mojo::Debut;
use Mojo::Base 'Mojolicious';
use Mojo::Log;

my $content; # Handle for the content dir

# This method will run once at server start
sub startup {
	my $self = shift;
	my @content_items;
	my @pages;
	my @header_links;
    $self->log->debug( "Running Mojolicious v". Mojolicious->VERSION );
	
	$self->log->debug( "Check for content dir: " );
	opendir $content, 'content' or die "'content' dir does not exist: $!\n";
	
	# Loop through files in content dir
	while( my $content_item = readdir $content ) {
		$self->log->debug( "$content_item \n" );
		@content_items = (@content_items, $content_item);
		if( $content_item =~ m/(\w+)\.md/ ){
			@pages = (@pages, $content_item);
			($content_item) =$1 ;
			@header_links = (@header_links, $content_item) unless( $content_item eq 'Home' );
		}
	}

	# Documentation browser under "/perldoc"
	$self->plugin('PODRenderer');

	# Router
	my $r = $self->routes;
	my %page_params = (
		controller => 'Page',
		action	=> 'load',
		content_items => \@content_items,
		pages => \@pages,
		header_links => \@header_links
	);

	# Create a new helper for stashing style rules in templates
	$self->helper(
		'style' => sub {
			my $c     = shift;
			my $stash = $c->stash;
			$stash->{style} = shift if @_;
			$c->stash(@_) if @_;
			return $stash->{style};
		}
	);
	  
	# Route to stylesheet templates before pages
	$r->get('/(:stylesheet).css')
	  ->to(
			controller => 'Stylesheet',
			action	=> 'load'
		);

	# Normal route to controller	  
	$r->get('/:section')
	  ->to( %page_params );
	  
	$r->any('/')
	  ->to(
			controller => 'Page',
			action	=> 'error'
		);
	  
	$r->any('/*')
	  ->to(
			controller => 'Page',
			action	=> 'error'
		);
	  
	$self->log->debug( "Close content dir" );
	closedir $content or die "$!";
}

1;
