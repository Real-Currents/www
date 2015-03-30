package MooseX::Role::WithOverloading::Meta::Role::Application::Composite::ToRole;
# ABSTRACT: Roles which support overloading
$MooseX::Role::WithOverloading::Meta::Role::Application::Composite::ToRole::VERSION = '0.16';
use Moose::Role;
use namespace::autoclean;

with qw(
    MooseX::Role::WithOverloading::Meta::Role::Application::Composite
    MooseX::Role::WithOverloading::Meta::Role::Application::ToRole
);

1;

__END__

=pod

=encoding UTF-8

=head1 NAME

MooseX::Role::WithOverloading::Meta::Role::Application::Composite::ToRole - Roles which support overloading

=head1 VERSION

version 0.16

=head1 AUTHORS

=over 4

=item *

Florian Ragwitz <rafl@debian.org>

=item *

Tomas Doran <bobtfish@bobtfish.net>

=back

=head1 COPYRIGHT AND LICENSE

This software is copyright (c) 2009 by Florian Ragwitz.

This is free software; you can redistribute it and/or modify it under
the same terms as the Perl 5 programming language system itself.

=cut
