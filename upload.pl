#!/usr/bin/env perl
use warnings;
use strict;
use 5.10.1;

# CGI transaction to upload files
use lib 'lib';
use CGI qw(chdir cwd);
use CGI::Carp qw(fatalsToBrowser);
use Mojo::JSON qw(decode_json encode_json);
use Mojolicious::Lite;

our $version = Mojolicious->VERSION;
my $log;
my $wkdir = cwd();
($wkdir) = $wkdir =~ /^((\/|\w|\-|\_|.)+)+$/;
my ($tx, $app, $fb_params);

plugin Mount => {'/pages' => "./webapp.pl"};

# Get a transaction
app->hook( after_build_tx => sub {
	($tx, $app) = @_;
	#$app->plugin( mail );
	
	# Request
	my $method = $tx->req->method;
	my $path   = $tx->req->url->path;
} );

get( '/index.html' => 'index' );

get( '/' => 'index' );

post( '/upload' => sub {
	my $c = shift;
	open $log, '>> '. $wkdir .'/log-uploads.txt' or die "Could not open file: $!";
	print $log "Access Time: ". localtime() ."\n";
	print $log "Starting in ". cwd() ."\n";
	
	my %fb_params = @{($tx->req->params)->{params}};
	print $log encode_json($fb_params) ."\n";

	# Get file attachment
	my @files; 
	for my $file ($tx->req->upload('file')) {
		if( $file->filename ) {
			my $size = $file->size;
			my $name = $file->filename;
			my $file_location = './public/uploads'. time() ."-$name";
			
			# Write file to feedback dir
			$file->move_to( $file_location );
			
			push @files, $file_location;
		}
	}	
	$fb_params = {};
	$$fb_params{'from'} = $fb_params{'from'} if( $fb_params{'from'} );
	$$fb_params{'type'} = $fb_params{'type'} if( $fb_params{'type'} );
	$$fb_params{'summ'} = $fb_params{'summ'} if( $fb_params{'summ'} );
	$$fb_params{'file'} = ('See screenshot @ '. $files[0]) if( @files );
	print $log "\n\n";
	close $log;	
	
	$c->render(text => "Your file was uploaded!");
	
	#Mojo::IOLoop->start unless Mojo::IOLoop->is_running;
	#$c->render_later;
} );

app->log->debug( "Mojolicious v$version\n\n" );
app->start();

__DATA__

@@ index.html.ep
<!DOCTYPE html>
<html><head>
	<title>Streaming multipart upload</title>
</head>
<body>
	%=	form_for '' => ( action => '/upload', method => 'POST', enctype => 'multipart/form-data' ) => begin
	%=		hidden_field 'type' => "3"
	%=		hidden_field 'from' => "me\@maponics.com" 
	%=		hidden_field 'summ' => "Testing"
	%=		file_field 'file'
	%=		submit_button 'Upload'
	%= 	end
	<!--form action="/upload" enctype="multipart/form-data" method="POST">
		<input name="example" type="file" />
		<input type="submit" value="Upload" />
	</form-->
</body></html>
