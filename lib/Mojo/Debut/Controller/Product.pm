package Mojo::Debut::Controller::Product;
use Mojo::Base 'Mojolicious::Controller';
use Mojo::Log;

sub default {
	  my $self = shift;
	  $self->render(text => <<HTML);
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml"><head>
<title>$Mojo::Debut::config->{title}</title>
<meta charset="UTF-8" />
<meta http-equiv="refresh" content="0;URL='/products/'" />
</head>
<body>
</body></html>
HTML

}

# This action will render a template
sub load {
	my $self = shift;
	my $log = Mojo::Log->new();
	my $msg = "";
    my $path = $self->req->url->path;

	$log->debug( "Path to product: ". $path );

	if( $self->stash('product_page') && ($self->stash('product_page') =~ /([\w|\-]+)/) ) {
		error( $self, @_ ) if(! $1 );
		$self->render_maybe(
			template => 'products/'.$1
		) or $self->reply->static(
			"/$1.html"
		) or error( $self, @_ );

	} elsif( $path !~ /\/$/ ) {
		$log->debug( "Path does not end with /" );
		$self->redirect_to('/products/');

	} else {
		$self->render_maybe(
			msg => 'Welcome to the Mojolicious real-time web framework!',
			template => 'welcome'
		);
	}

	return 1;
}

sub error {
	my $self = shift;
	$self->reply->static('.errordocs/missing.html');
#	$self->render(text => "404");

	return 1
}

1;
