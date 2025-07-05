import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Users, CheckCircle2, Clock, CreditCard, RefreshCcw } from 'lucide-react';
import { MunicipalService } from '@/types';

interface ServiceCardProps {
  service: MunicipalService;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => {
  const IconComponent = () => {
    switch (service.icon) {
      case 'bar-chart':
        return <BarChart3 className="h-10 w-10 text-primary" />;
      case 'users':
        return <Users className="h-10 w-10 text-primary" />;
      case 'check-circle':
        return <CheckCircle2 className="h-10 w-10 text-primary" />;
      case 'clock':
        return <Clock className="h-10 w-10 text-primary" />;
      case 'credit-card':
        return <CreditCard className="h-10 w-10 text-primary" />;
      case 'refresh-ccw':
        return <RefreshCcw className="h-10 w-10 text-primary" />;
      default:
        return <BarChart3 className="h-10 w-10 text-primary" />;
    }
  };
  
  return (
    <Card className="h-full hover:shadow-lg transition-all">
      <CardHeader>
        <div className="mb-4">
          <IconComponent />
        </div>
        <CardTitle>{service.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-base text-muted-foreground">
          {service.description}
        </CardDescription>
      </CardContent>
    </Card>
  );
};

export default ServiceCard;