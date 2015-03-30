package MooseX::Role::WithOverloading::Meta::Role::Application::ToRole;
# ABSTRACT: Roles which support overloading
$MooseX::Role::WithOverloading::Meta::Role::Application::ToRole::VERSION = '0.16';
use Moose::Role;
use aliased 'MooseX::Role::WithOverloading::Meta::Role::Application::ToClass';
use aliased 'MooseX::Role::WithOverloading::Meta::Role::Application::ToInstance';
use namespace::autoclean;

with 'MooseX::Role::WithOverloading::Meta::Role::Application';

around apply => sub {
    my ($next, $self, $role1, $role2) = @_;
    my $new_role2 =  Moose::Util::MetaRole::apply_metaroles(
        for            => $role2,
        role_metaroles => {
            application_to_class    => [ToClass],
            application_to_role     => [__PACKAGE__],
            application_to_instance => [ToInstance],
        },
    );
    # Horrible hack as we have just got a new metaclass with no attributes
    foreach my $name ( $role2->get_attribute_list ) {
        $new_role2->add_attribute($role2->get_attribute($name));
    }

    return $self->$next($role1, $new_role2);
};

1;

__END__

=pod

=encoding UTF-8

=head1 NAME

MooseX::Role::WithOverloading::Meta::Role::Application::ToRole - Roles which support overloading

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
