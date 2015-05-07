#!/usr/bin/perl
package Test::Lib;

use Test::More 'no_plan';

sub readContent( $ );
sub testPrint( $ );

sub testPrint( $ ) {
	my $msg = shift;
	print $msg;
}

sub readContent( $ ) {
	my $content = shift;
	my @content_items;
	
	return unless( -e -d $content );

	opendir $content, $content or die "$!";
	
	# Loop through files in content dir
	while( my $content_item = readdir $content ) {
		@content_items = (@content_items, $content_item);
	}
	
	for my $content_item( sort @content_items ) {
		print "&nbsp;&nbsp; $content_item<br />\n" unless( $content_item =~ m/^\.(?:[A-Za-gi-z]|\.|$)/ );
	}
	
	return closedir $content ;
}

#ok( testPrint("Testing...\n") );

1;
