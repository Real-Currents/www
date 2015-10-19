package Mojo::Debut::Controller::Contact;
use Mojo::Base 'Mojolicious::Controller';
use Mojo::JSON ('decode_json', 'encode_json');
use Mojo::Log;
use Fcntl (':flock', 'O_RDWR', 'SEEK_END' );
use Tie::File;

# Subroutines for using flock on data files
sub lock {
  my( $fh ) = @_;
  flock($fh, LOCK_EX) or die "Cannot lock data file - $!\n";
}
sub unlock {
  my( $fh ) = @_;
  flock($fh, LOCK_UN) or die "Cannot unlock data file - $!\n";
}

# Return full contact list to requester
sub list {
	my $self = shift;
	$self->reply->static('../data/contacts_list.json')
        if( -e -r -w 'data/contacts_list.json'
            or return error($self, "No contact email have been recorded: $!") );

    return 1;
}

# Save an email entry to the contact list
sub save {
	my $self = shift;
	my $date = localtime(time);
	my $error;
	my $fh;
	my @contacts_list;
	my $log = Mojo::Log->new;

	if( $self->param('email') && ($self->param('email') =~ /([\w|\-]+[@][\w|\-|\.]+)/) ) {
		my $email = $1;
		my $saved = { Date => $date, Email => $email };

        unless( -e -r -w 'data/contacts_list.json' ) {
        	open $fh, '>', 'data/contacts_list.json' or $error = "Could not create contact list: $!";
            $fh->print("[\n]\n");
            close $fh or $error = "Could not close contact list: $!";
        }

        unless( $error ) {
    		open $fh, '+<', 'data/contacts_list.json' or $error = "Could not open contact list: $!";
    		lock $fh or $error = "Could not lock filehandle to contact list: $!";
    		tie @contacts_list, 'Tie::File', $fh;
    		my $idx = 0;
    		for ( @contacts_list ) {
    			$log->debug( $_ );
    			if( $_ =~ /(??{$email})/ ) {
    				$error = "$email is already on our list. Thank you.";
    				last;
    			}
    			if( $_ =~ /^\]/ ) {
    				$contacts_list[($idx - 1)] = $contacts_list[($idx - 1)] .","
                        unless( $contacts_list[($idx - 1)] =~ /\[/ );
    				$contacts_list[$idx] = "\t". &encode_json($saved) ."\n]";
    				$log->debug( encode_json($saved) );
    			}
    			$idx++;
    		}
    		unlock $fh or $error = "Could not unlock filehandle to contact list: $!";
    		close $fh or $error = "Could not close contact list: $!";

    		unless( $error ) {
    			$self->render_maybe( json => $saved ) or $error = "$!";

                return 1;
    		}
        }

        return error( $self, $error ) if( $error );
	}

    return error($self, 'Invalid Email!');
}

sub error {
	my $self = shift;
	my $error = shift;
#	$self->reply->static('.errordocs/missing.html');
	$self->render(json => { Error => $error }, status => 500);

    return 1;
}

1;
