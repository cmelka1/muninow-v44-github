import React from 'react';
import { Feature } from '@/types';
import FeatureCard from './FeatureCard';
import ResponsiveContainer from '@/components/ui/responsive-container';
import { useResponsiveNavigation } from '@/hooks/useResponsiveNavigation';

const featuresData: Feature[] = [
  {
    id: '1',
    title: 'Secure Payment Processing',
    description: 'End-to-end encryption and compliance with the highest security standards to protect all payment information.',
    icon: 'shield',
    benefits: ['PCI DSS Compliance', 'Advanced Encryption', 'Fraud Protection', 'Bank-Level Security']
  },
  {
    id: '2',
    title: 'Multiple Payment Methods',
    description: 'Support for credit cards, bank transfers, digital wallets, and other payment options for maximum flexibility.',
    icon: 'payment-methods',
    benefits: ['Credit/Debit Cards', 'ACH Transfers', 'Digital Wallets', 'Mobile Payments']
  },
  {
    id: '3',
    title: 'Automated Reminders',
    description: 'Customizable notification system to keep residents informed about upcoming bills and payments due.',
    icon: 'clock',
    benefits: ['Email Notifications', 'SMS Alerts', 'Custom Schedules', 'Multilingual Support']
  },
  {
    id: '4',
    title: 'Payment Verification',
    description: 'Instant confirmation of successful payments with digital receipts for record-keeping.',
    icon: 'check-circle',
    benefits: ['Instant Confirmation', 'Digital Receipts', 'Audit Trail', 'Dispute Resolution']
  },
  {
    id: '5',
    title: 'Detailed Analytics',
    description: 'Comprehensive reports and insights to help municipalities track payment trends and financial health.',
    icon: 'bar-chart',
    benefits: ['Revenue Analytics', 'Payment Trends', 'Custom Reports', 'Performance Metrics']
  },
  {
    id: '6',
    title: 'Automatic Data Reconciliation',
    description: 'Automates data reconciliation across all IT systems, including ERP, permitting, licensing, and ticketing platforms.',
    icon: 'refresh-ccw',
    benefits: ['ERP Integration', 'Real-time Sync', 'Error Reduction', 'Automated Reporting']
  }
];

const FeaturesGrid: React.FC = () => {
  const { isMobile } = useResponsiveNavigation();

  return (
    <section className="bg-background">
      <ResponsiveContainer variant="section" maxWidth="6xl">
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${isMobile ? 'gap-4' : 'gap-6'}`}>
          {featuresData.map((feature) => (
            <FeatureCard key={feature.id} feature={feature} />
          ))}
        </div>
      </ResponsiveContainer>
    </section>
  );
};

export default FeaturesGrid;