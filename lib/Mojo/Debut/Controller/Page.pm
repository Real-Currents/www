package Mojo::Debut::Controller::Page;
use Mojo::Base 'Mojolicious::Controller';

# This action will render a template
sub load {
	my $self = shift;
	my $msg = "";
	
	# Render template "welcome" with message
	$msg = 'Welcome to the Mojolicious real-time web framework!' 
		if( $self->stash('section') eq "welcome" );
		
	if( $self->stash('section') =~ /(\w+)/ ) {
		$self->render_maybe( 
			msg => $msg,
			template => $1 
		) or error( $self, @_ );
	} else {
		$self->render(
			msg => $msg,
			template => 'welcome'
		);
	}
}

sub error {
	my $self = shift;
	$self->reply->static('.errordocs/missing.html');
}

1;
