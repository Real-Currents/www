package Mojo::Debut;
use Mojo::Base 'Mojolicious';
use Mojo::Log;

my $content; # Handle for the content dir

# This method will run once at server start
sub startup {
	my $self = shift;
	my $log = $self->log;
	my @content_items;
	my @pages;
	my @header_links;
	
    $log->debug( "Running Mojolicious v". Mojolicious->VERSION );
	
	$log->debug( "Check for content dir: " );
	opendir $content, 'public/content' or die "'content' dir does not exist: $!\n";
	
	# Loop through files in content dir
	while( my $content_item = readdir $content ) {
		$log->debug( "$content_item \n" );
		@content_items = (@content_items, $content_item);
		if( $content_item =~ m/(\w+)\.md/ ){
			@pages = (@pages, $content_item);
			($content_item) =$1 ;
			@header_links = (@header_links, $content_item) unless( $content_item eq 'Home' );
		}
	}

	# Documentation browser under "/perldoc"
	$self->plugin('PODRenderer');
	
	# Select index file
	$self->plugin(
		'Directory' => { 
			root => 'public',
			dir_index => [qw'default.html index.html index.htm'] 
		});
	
	# Check requests
	my $reqCheck = sub {
		my $self = shift;
		my $req = $self->req;
		my $path = $req->url->path;
    	$log->debug( "Requested resource is ". $req->url );
		
		# Remove route heading if more than one node listed in path
		if( $path =~ /(pages|sections|scripts|styles)(\/[\w|\-]+)\/.+/ ) {
			$path =~ s/(?:pages|sections|scripts|styles)//;
			$path =~ s/(\/\/)/\//;
			$log->debug( "Modified request is ". $req->url->path($path) );
		}
	};
	$self->hook(before_dispatch => $reqCheck);

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
	$r->get('/styles/(:stylesheet).css')
	  ->to(
			controller => 'Stylesheet',
			action	=> 'load'
		);

	# Normal route to controller	  
	$r->get('/pages/(:page)')
	  ->to( %page_params );
	  
	$r->get('/sections/(:section)')
	  ->to( %page_params );

	# Error handling for non-routable URLs
#	$r->any('/*')
#	  ->to(
#			controller => 'Page',
#			action	=> 'error'
#		);
	
	$log->debug( "Close content dir" );
	closedir $content or die "$!";
}

1;
