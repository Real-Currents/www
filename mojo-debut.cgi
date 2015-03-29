#!/usr/bin/env perl
use warnings;
use strict;
use :5.10;

use lib 'lib';
use CGI;
use CGI::Carp qw(fatalsToBrowser);
use Config;
use Cwd qw(cwd);
use Test::Lib;

# Start command line interface for application
use Mojolicious::Commands;
BEGIN { unshift( @INC, "lib"); }

Mojolicious::Commands->start_app('Mojo::Debut');
