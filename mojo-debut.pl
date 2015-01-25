#!/usr/bin/env perl
use strict;
use warnings;

# Start command line interface for application
use Mojolicious::Commands;
BEGIN { unshift( @INC, "lib"); }

Mojolicious::Commands->start_app('MojoDebut');
