package Mojo::Debut;
use base qw(Contenticious);
use Mojo::Log;
use IO::Handle;

my $content; # Handle for the content dir

# This method will run once at server start
sub startup {
	my $self = shift;

	my $log = $self->log;
	my @content_items;
	my @content_dirs;
	my @pages;
	my @header_links;
	$content = new IO::Handle;

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
		} else {
			@content_dirs = (@content_dirs, $content_item);
		}
	}

	$log->debug( "Close content dir" );
	closedir $content or die "$!\n";

	# Check (& clean) request path
	my $reqCheck = sub {
		my $self = shift;
		my $req = $self->req;
		my $path = $req->url->path;
	    
		$log->debug( "Requested resource is ". $req->url );

		# Match request path to content path for content resources (images, audio, video, etc.)
		for my $cpath (@content_dirs) {
			if( $path =~ /(\/$cpath\/)(images|audio|video)\/.+/ ) {
				$path =~ s/($cpath)/content\/$cpath/;
				$log->debug( "Modified request is ". $req->url->path($path) );
				
			} elsif( $path =~ /\/$cpath$/ ) {
				$path =~ s/($cpath)/$1\//;
				$log->debug( "Modified request is ". $req->url->path($path) );
				$self->redirect_to($path);
				
			} elsif( $path =~ /\/$cpath\.html$/ ) {
				$path =~ s/($cpath)\.html/$1\//;
				$log->debug( "Modified request is ". $req->url->path($path) );
				$self->redirect_to($path);
				
			}
		}

		# Remove route heading for these types if more than one node in path
		if( $path =~ /(products|scripts|styles)(\/[\w|\-]+)\/.+/ ) {
			$path =~ s/(?:products)//;
			$path =~ s/(\/\/)/\//;
			$log->debug( "Modified request is ". $req->url->path($path) );
		}
	};
	$self->hook(before_dispatch => $reqCheck);

	# Helper to browse documentation under "/perldoc"
	#$self->plugin('PODRenderer');

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

	# Router
	my $r = $self->routes;
	my %page_params = (
		controller => 'Product',
		action	=> 'load',
		content_items => \@content_items,
		pages => \@pages,
		header_links => \@header_links
	);

	# Route to list contacts
	$r->get('/contacts/list')
	  ->to(controller => 'Contact', action => 'list');

	# Route to save contact
	$r->post('/contacts')
	  ->to(controller => 'Contact', action => 'save');

	# Route to javascript templates before pages
	$r->get('/scripts/(:javascript).js')
	  ->to(controller => 'JavaScript', action => 'load');

	# Route to stylesheet templates before pages
	$r->get('/styles/(:stylesheet).css')
	  ->to(controller => 'Stylesheet', action => 'load');

	# Normal route to controller
	$r->get('/')->to(cb => sub{ +shift->render(template => 'index', format => 'html') });

	# Default route to site index if default page exists
	$log->debug( "Checking for default page... " );
	opendir $content, 'public' or die "$!\n";
	while( my $page = readdir $content ) {
		my $index = undef;
		my( $default ) = $page =~ /((?:default|index|readme)\.html)/i;
		if( $default ) {
			$index = sub {
				my $self = shift;
				$log->debug( "Found default: "+ $default);
				$log->debug( "Get default route..." );
				$self->reply->static($default);
			};
			$r->get('/')->to(cb => $index);
		
		} else {
			$index = sub {
				my $self = shift;
				$log->debug( "No default");
				$log->debug( "Get default route..." );
				$self->reply->static('../index.html');
			};
		}
		$r->get('/default')->to(cb => $index);
		$r->get('/index')->to(cb => $index);
		$r->get('/index.html')->to(cb => $index);
	}
	closedir $content or die "$!\n";

	# Normal route to controller
	$r->get('/products/(:product_page)')
	  ->to(%page_params);

	$r->get('/products*')
	  ->to(%page_params);

	$r->get('/products')
	  ->to(cb => sub {
		my $self = shift;
		$self->render(text => <<HTML);
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd" >
<html xmlns="http://www.w3.org/1999/xhtml"><head>
  <title>Default Index</title>
  <meta http-equiv="content-type" content="text/html; charset=utf-8" />
  <meta http-equiv="refresh" content="0;URL='products/'" />
</head>
<body>
</body></html>
HTML

	});

	$self->Contenticious::startup(@_); #SUPER::startup(@_);

	# Error handling for non-routable URLs
	$r->any('/*')
	  ->to(
			controller => 'Product',
			action	=> 'error'
		);

}

1;
