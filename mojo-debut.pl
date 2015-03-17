#!/usr/bin/env perl
use 5.10.1;
use strict;
use warnings;

# Start command line interface for application
use Mojolicious::Commands;
say Mojolicious->VERSION;
BEGIN { unshift( @INC, "lib"); }

Mojolicious::Commands->start_app('Mojo::Debut');
