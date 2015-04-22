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

# Start command line interface for application
BEGIN { unshift( @INC, "lib"); }
use Mojolicious::Commands;

Mojolicious::Commands->start_app('Mojo::Debut');
