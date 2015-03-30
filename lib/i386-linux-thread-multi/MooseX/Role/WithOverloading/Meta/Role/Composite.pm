package MooseX::Role::WithOverloading::Meta::Role::Composite;
# ABSTRACT: Role for composite roles which support overloading
$MooseX::Role::WithOverloading::Meta::Role::Composite::VERSION = '0.16';
use Moose::Role;
use Moose::Util::MetaRole;
use aliased 'MooseX::Role::WithOverloading::Meta::Role::Application::Composite::ToClass';
use aliased 'MooseX::Role::WithOverloading::Meta::Role::Application::Composite::ToRole';
use aliased 'MooseX::Role::WithOverloading::Meta::Role::Application::Composite::ToInstance';

use namespace::autoclean;

#pod =method apply_params
#pod
#pod Wrapped method to apply various metaclass roles to aid with role composition.
#pod
#pod =cut

around apply_params => sub {
    my ($next, $self, @args) = @_;
    return Moose::Util::MetaRole::apply_metaroles(
        for            => $self->$next(@args),
        role_metaroles => {
            application_to_class    => [ToClass],
            application_to_role     => [ToRole],
            application_to_instance => [ToInstance],
        },
    );
};

1;

__END__

=pod

=encoding UTF-8

=head1 NAME

MooseX::Role::WithOverloading::Meta::Role::Composite - Role for composite roles which support overloading

=head1 VERSION

version 0.16

=head1 METHODS

=head2 apply_params

Wrapped method to apply various metaclass roles to aid with role composition.

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
