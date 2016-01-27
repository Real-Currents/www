package Mojo::Debut::Controller::Media;
use Mojo::Base 'Mojolicious::Controller';
use Mojo::Log;

sub load {
    my $self = shift;
    my $req = $self->req;
    my $path = $req->url->path;

    if( $path =~ /(\/$cpath\/)(images|audio|video)\/.+/ ) {
        $path =~ s/($cpath)/content\/$cpath/;
        $log->debug( "Modified request is ". $req->url->path($path) );
        $self->redirect_to($path);
    }
}

1;
