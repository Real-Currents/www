package Mojo::Debut::Controller::Page;
use Mojo::Base 'Mojolicious::Controller';

# This action will render a template
sub load {
	my $self = shift;
	my $msg = "";
	
	# Render template "welcome" with message
	$msg = 'Welcome to the Mojolicious real-time web framework!' 
		if( $self->stash('page') eq "welcome" );
		
	if( $self->stash('page') =~ /([\w|\-]+)/ ) {
		$self->render_maybe( 
			msg => $msg,
			template => $1 
		);# or error( $self, @_ );
		
	} else {
		error( $self, @_ );
	}
}

sub error {
	my $self = shift;
	
	# Render an error page
	$self->reply->static('error.html');
}

1;
