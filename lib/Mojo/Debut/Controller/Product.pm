package Mojo::Debut::Controller::Product;
use Mojo::Base 'Mojolicious::Controller';

# This action will render a template
sub load {
	my $self = shift;
	my $msg = "";
	
	# Render template "welcome" with message
	$msg = 'Welcome to the Mojolicious real-time web framework!' 
		if( $self->stash('product_page') && ($self->stash('product_page') eq "welcome") );
		
	if( $self->stash('product_page') && ($self->stash('product_page') =~ /([\w|\-]+)/) ) {
		error( $self, @_ ) if(! $1 );
		$self->render_maybe( 
			msg => $msg,
			template => $1 
		) or $self->reply->static(
			"/$1.html"
		) or error( $self, @_ );
		
	} 
#	else {
#		$self->render_maybe( 
#			template => 'arpeggio_intro'
#		);
#	}
}

sub error {
	my $self = shift;
	
	# Render an error page
#	$self->reply->static('.errordocs/missing.html');
	$self->render(text => "404");
}

1;
