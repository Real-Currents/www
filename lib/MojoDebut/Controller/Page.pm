package MojoDebut::Controller::Page;
use Mojo::Base 'Mojolicious::Controller';

# This action will render a template
sub load {
	my $self = shift;
	my $msg = "";
	
	# Render template "welcome" with message
	$msg = 'Welcome to the Mojolicious real-time web framework!' 
		if( $self->stash('section') eq "welcome" );
	
	$self->render(
		msg => $msg,
		template => 'index'
	  );
}

1;
