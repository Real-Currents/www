package Mojo::Debut::Controller::JavaScript;
use Mojo::Base 'Mojolicious::Controller';

# This action will render a template
sub load {
	my $self = shift;
	if( $self->stash('javascript') ) {
		my $javascript = $self->stash('javascript');
		$self->render_maybe( 
			template => "scripts/$javascript", 
			format => 'js', 
			handler => 'ep' 
		) or error( $self, @_ );
	} else {
		error( $self, @_ );
	}
}

sub error {
	my $self = shift;
	$self->reply->static('.errordocs/missing.html');
#	$self->render(text => "404");
}

1;
