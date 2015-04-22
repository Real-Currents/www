#!/usr/bin/env perl
use warnings;
use strict;
use 5.10.1;

use lib 'lib';
use CGI;
use CGI::Carp qw(fatalsToBrowser);
use Config;
use Cwd qw(cwd);
use Test::Lib;

#use Mojo;
#use Mojolicious;

# Disable uploads when using CGI.pm
$CGI::DISABLE_UPLOADS	= 1;
# Limit POST request size to 100KB
$CGI::POST_MAX		= 102_400; #100K

my @some_args = @ARGV;
my $q = new CGI;

print $q->header("text/html");
print $q->start_html("CGI Environment Variables");

print "<h4>Perl version $], CGI.pm version $CGI::VERSION</h4>\n";

print "Hi, this is a test message<br />\n";
Test::Lib::testPrint "One more test message printed by Test::Lib\n";

print "<h4>Host machine:</h4>\n";
print "$Config{osname}<br />\n";
print "$Config{archname}<br />\n";

print "<br \>\n", cwd, "<br />\n";
chdir '../';
print "<br \>\n", cwd, "<br />\n";
Test::Lib::readContent( cwd );
chdir '../';
print "<br \>\n", cwd, "<br />\n";
Test::Lib::readContent( cwd );
chdir '../';
print "<br \>\n", cwd, "<br />\n";
Test::Lib::readContent( cwd );
print "<br \>\n", cwd.'/htconfig', "<br />\n";
Test::Lib::readContent( cwd.'/htconfig' );

# List standard %ENV variables

my $homedir = ( getpwuid($>) )[7] if( defined(&getpwuid) );
print "homedir: $homedir <br />\n" if( $homedir );

foreach my $qparam (keys %{($q->Vars)}) {
	print "$qparam: ". $q->param($qparam) ."<br>\n";
}

foreach my $var_name ( sort keys %ENV ) {
  print "<h3>$var_name</h3>\n";
  print $ENV{$var_name} . "<br />";
  print "\n";
}

if (($ENV{HTTP_HOST}) && ($ENV{HTTP_HOST} =~ /lovedemands./)) {
  print "That sub-domain redirects to ./lovedemands";
}

print $q->end_html;
print "\n";
