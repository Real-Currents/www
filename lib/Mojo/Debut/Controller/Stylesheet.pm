package Mojo::Debut::Controller::Stylesheet;
use Mojo::Base 'Mojolicious::Controller';

# This action will render a template
sub load {
	my $self = shift;
	my $stylesheet = $self->stash('stylesheet');
	$self->render( template => "styles/$stylesheet", format => 'css', handler => 'ep' );
}

1;
