use Mojo::Base -strict;

use Test::More;
use Test::Mojo;

BEGIN { unshift( @INC, "lib"); }

my $t = Test::Mojo->new('Mojo::Debut');
$t->get_ok('/')->status_is(200)->content_like(qr/Mojo-Debut/i);

done_testing();
