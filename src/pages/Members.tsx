import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { Users, Mail, Phone, UserMinus, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganizationMembers } from '@/hooks/useOrganizationMembers';
import { InviteMemberDialog } from '@/components/InviteMemberDialog';

const Members = () => {
  const navigate = useNavigate();
  const { user, profile, isLoading } = useAuth();
  const { members, isLoading: membersLoading, inviteMember, removeMember, updateMemberRole } = useOrganizationMembers();

  // Redirect unauthenticated users
  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/signin');
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getOrganizationLabel = () => {
    switch (profile?.account_type) {
      case 'business': return { singular: 'team member', plural: 'team members' };
      case 'municipal': return { singular: 'organization member', plural: 'organization members' };
      default: return { singular: 'household member', plural: 'household members' };
    }
  };

  const organizationLabels = getOrganizationLabel();
  
  const adminCount = members.filter(m => m.role === 'admin').length;
  const userCount = members.filter(m => m.role === 'user').length;

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const handleRemoveMember = async (memberId: string) => {
    await removeMember(memberId);
  };

  const handleUpdateRole = async (memberId: string, newRole: 'admin' | 'user') => {
    await updateMemberRole(memberId, newRole);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1 bg-gray-100">
          <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
              <div className="mb-6 md:mb-8">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Members</h1>
                    <p className="text-gray-600">
                      Manage {organizationLabels.plural} and their access.
                    </p>
                  </div>
                  <InviteMemberDialog onInvite={inviteMember} />
                </div>
              </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6 md:mb-8">
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-semibold text-gray-900">Total Members</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl md:text-2xl font-bold text-gray-900">{members.length}</div>
                  <p className="text-sm text-gray-600">
                    Active {organizationLabels.plural}
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-semibold text-gray-900">Admins</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl md:text-2xl font-bold text-gray-900">{adminCount}</div>
                  <p className="text-sm text-gray-600">
                    Admin roles
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-semibold text-gray-900">Members</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl md:text-2xl font-bold text-gray-900">{userCount}</div>
                  <p className="text-sm text-gray-600">
                    Regular members
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Members List */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  {profile?.account_type === 'business' ? 'Team Members' : 
                   profile?.account_type === 'municipal' ? 'Organization Members' : 'Household Members'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {membersLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : members.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No {organizationLabels.plural} yet.</p>
                    <p className="text-sm">Invite someone to get started.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {members.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <Avatar>
                            <AvatarFallback>{getInitials(member.first_name, member.last_name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-gray-900">{member.first_name} {member.last_name}</div>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {member.email}
                              </div>
                              {member.phone && (
                                <div className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  {member.phone}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="text-right mr-4">
                            <div className="flex items-center gap-1 font-medium text-gray-900">
                              {member.role === 'admin' && <Shield className="h-3 w-3" />}
                              {member.role === 'admin' ? 'Admin' : 'Member'}
                            </div>
                            <div className="text-sm text-green-600">Active</div>
                          </div>
                          {member.member_id !== user?.id && (
                            <div className="flex items-center space-x-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUpdateRole(member.member_id, member.role === 'admin' ? 'user' : 'admin')}
                              >
                                {member.role === 'admin' ? 'Make Member' : 'Make Admin'}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRemoveMember(member.member_id)}
                              >
                                <UserMinus className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Members;