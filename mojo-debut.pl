#!/usr/bin/env perl
use 5.10.1;
use strict;
use warnings;

# Start command line interface for application
BEGIN { unshift( @INC, "lib"); }
use Mojolicious::Commands;

Mojolicious::Commands->start_app('Mojo::Debut');
