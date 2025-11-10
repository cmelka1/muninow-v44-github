import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download } from 'lucide-react';
import { MunicipalServiceTile } from '@/hooks/useMunicipalServiceTiles';

interface ServiceTileCardProps {
  tile: MunicipalServiceTile;
  onApply: (tile: MunicipalServiceTile) => void;
}

const ServiceTileCard: React.FC<ServiceTileCardProps> = ({ tile, onApply }) => {
  return (
    <Card className="h-full hover:shadow-lg transition-all duration-200 border-border hover:border-primary/20">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl mb-2 text-foreground">{tile.title}</CardTitle>
            {tile.description && (
              <CardDescription className="text-muted-foreground">
                {tile.description}
              </CardDescription>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-4">
          {tile.pdf_form_url && (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                window.open(tile.pdf_form_url, '_blank');
              }}
              className="w-full gap-2"
            >
              <Download className="h-4 w-4" />
              Download Reference Form
            </Button>
          )}
          
          <Button 
            onClick={() => onApply(tile)}
            className="w-full"
            size="lg"
          >
            Apply Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceTileCard;