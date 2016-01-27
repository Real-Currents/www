package Mojo::Debut;
use base qw(Contenticious);
use Cwd qw(chdir cwd getcwd);
use Mojo::Log;
use IO::Handle;

our($config, $content);

# This method will run once at server start
sub startup {
	my $self = shift;

	# Find out config file name
	my $config_file = $ENV{CONTENTICIOUS_CONFIG};
	$config_file  //= $self->home->rel_file('config');

	# Config
	our $config = $self->plugin(Config => {file => $config_file});

	# Handle for the content dir
	$content = new IO::Handle;

    my $content_root = $config->{pages_dir} || 'content';

	my( $default,
        @content_items,
        @content_dirs,
        @pages,
        @header_links
    );

    # Logger
	our $log = $self->log;

    $log->debug( "Running Mojolicious v". Mojolicious->VERSION );

	$log->debug( "Check for content dir: " );
	opendir $content, $content_root or die "Cannot access content dir: $!\n";

	# Loop through files in content dir
	while( my $content_item = readdir $content ) {
		$log->debug( "$content_item \n" );

        $log->debug( "Checking for default page... " );
        ($default) = $content_item =~ /(?:default|index|readme)\.(?:html|md)/i;

		@content_items = (@content_items, $content_item);
		if( $content_item =~ m/(\w+)\.md/ ){
			@pages = (@pages, $content_item);
			($content_item) =$1 ;
			@header_links = (@header_links, $content_item) unless( $content_item =~ /Home/ );
		} else {
			@content_dirs = (@content_dirs, $content_item);
		}
	}

    # Add content directory as path to static files
    my $static = $self->static;
    push @{$static->paths}, ($content_root);

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
            next if( $cpath =~ /\.$/ );

            if( ($path =~ /$cpath$/) and !($cpath =~ /\.[\w|\+]+$/) ) {
				$path =~ s/(\/$cpath)/$1\// unless( $path =~ /$cpath\.[\w|\+]+$/ );
				$log->debug( "Modified request is ". $req->url->path($path) );
				$self->redirect_to($path);

			} #elsif( $path =~ /(\/$cpath\/)(images|audio|video)\/.+/ ) {
#				$path =~ s/($cpath)/content\/$cpath/;
#				$log->debug( "Modified request is ". $req->url->path($path) );
#				$self->redirect_to($path);
#
#			} #elsif( $path =~ /\/$cpath\.html$/ ) {
#				$path =~ s/($cpath)\.html/$1\//;
#				$log->debug( "Modified request is ". $req->url->path($path) );
#				$self->redirect_to($path);
#
#			}
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
	$self->plugin('PODRenderer');

	# Create a new helper for stashing names of style templates in content/layout templates
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
	our $r = $self->routes;
	my %page_params = (
		content_items => \@content_items,
		pages => \@pages,
		header_links => \@header_links
	);

  	# Default route to site index if no default in content && default page/template exists
  	unless( $default ) {
	  # Normal route to controller
	  #$r->get('/')->to(cb => sub{ +shift->render(template => 'index', format => 'html') });

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
			  $r->get('/default')->to(cb => $index);
			  $r->get('/index')->to(cb => $index);
			  $r->get('/index.html')->to(cb => $index);

		  } else {
			  $index = sub {
				  my $self = shift;
				  $log->debug( "No default");
				  $log->debug( "Get default route..." );
				  $self->reply->static('../index.html');
			  };
		  }
	  }
	  closedir $content or die "$!\n";
  	}

    # Handle some special routes for the developer profile links
    do 'content/dev/index.pl';

	# Route to list contacts
	$r->get('/contacts/list')
	  ->to( controller => 'Contact', action => 'list' );

	# Route to save contact
	$r->post('/contacts')
	  ->to( controller => 'Contact', action => 'save' );

	# Route to javascript templates before pages
	$r->get('/scripts/(:javascript).js')
	  ->to( controller => 'JavaScript', action => 'load' );

	# Route to stylesheet templates before pages
	$r->get('/styles/(:stylesheet).css')
	  ->to( controller => 'Stylesheet', action => 'load' );

	# Normal route to controller
	my $products = $r->get('/products')
	  ->to( controller => 'Product', action => 'default' );

	$products->get('/')
 	  ->to(
 	  		controller => 'Product',
   			action	=> 'load',
 			%page_params
 		);

	$products->get('/(:product_page)')
	  ->to(
	  		controller => 'Product',
  			action	=> 'load',
			%page_params
		);


	$self->Contenticious::startup(@_); #SUPER::startup(@_);

	# Error handling for non-routable URLs
	$r->any('/*')
	  ->to(
			controller => 'Product',
			action	=> 'error'
		);

}

1;
