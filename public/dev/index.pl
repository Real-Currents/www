package Mojo::Debut;

$log->debug("Registering special routes in dev");

$log->debug("Currents router: ". $r);

$r->get('/tangible')
  ->to(cb => sub {
    my $self = shift;
    $self->redirect_to('https://'. $ENV{TANGAUTH} .'@tangiblecorp.herokuapp.com/product/index.html');
  });

1;
