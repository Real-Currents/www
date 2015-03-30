package Mojo::Debut::Controller::Stylesheet;
use Mojo::Base 'Mojolicious::Controller';

# This action will render a template
sub load {
	my $self = shift;
	my $stylesheet = $self->stash('stylesheet');
	$self->render_maybe( 
		template => "styles/$stylesheet", 
		format => 'css', 
		handler => 'ep' 
	); #or error( $self, @_ );
}

sub error {
	my $self = shift;
	$self->reply->static('error.html');
}

1;
