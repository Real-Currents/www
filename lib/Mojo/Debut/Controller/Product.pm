package Mojo::Debut::Controller::Product;
use Mojo::Base 'Mojolicious::Controller';

# This action will render a template
sub load {
	my $self = shift;
	my $msg = "";

	if( $self->stash('product_page') && ($self->stash('product_page') =~ /([\w|\-]+)/) ) {
		error( $self, @_ ) if(! $1 );
		$self->render_maybe(
			template => 'products/'.$1
		) or $self->reply->static(
			"/$1.html"
		) or error( $self, @_ );

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
