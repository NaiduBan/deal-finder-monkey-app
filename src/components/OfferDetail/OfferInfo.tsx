
import { Offer } from '@/types';
import { Clock, Info, Tag, Grid, MapPin, AlertCircle, Copy, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useOfferActions } from '@/hooks/use-offer-actions';

const stripHtmlTags = (str: string | null) => {
  if (!str) return '';
  return str.replace(/<[^>]*>/g, '');
};

const formatTermsLineByLine = (terms: string | null) => {
  if (!terms) return [];
  const cleanTerms = stripHtmlTags(terms);
  // Split by common delimiters and filter out empty lines
  return cleanTerms
    .split(/[.;]\s*/)
    .map(line => line.trim())
    .filter(line => line.length > 0 && line !== '.')
    .map(line => line.endsWith('.') ? line : line + '.');
};

const OfferInfo = ({ offer }: { offer: Offer }) => {
  const { copyCode } = useOfferActions(offer);

  const InfoRow = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string | null | undefined }) => {
    if (!value) return null;
    return (
      <div className="flex items-start space-x-3">
        <Icon className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="font-medium text-gray-800">{value}</p>
        </div>
      </div>
    );
  };

  const termsLines = formatTermsLineByLine(offer.termsAndConditions || offer.terms);

  return (
    <div className="space-y-4 p-4 md:p-0">
      {/* Terms & Conditions - Left side, prominent */}
      {termsLines.length > 0 && (
        <Card className="border-l-4 border-l-red-500">
          <CardHeader>
            <CardTitle className="text-lg text-red-700 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              Terms & Conditions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {termsLines.map((line, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <span className="text-red-500 font-bold mt-1 flex-shrink-0">•</span>
                  <p className="text-sm text-gray-700 leading-relaxed">{line}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-6">
          <p className="font-semibold text-spring-green-600 mb-1">{offer.store}</p>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            {offer.title || offer.description}
          </h1>

          <div className="space-y-3">
            {offer.status && (
              <div className="flex items-center text-sm text-green-700 bg-green-50 p-2 rounded-md">
                <AlertCircle className="w-4 h-4 mr-2" />
                <span className="font-medium">Status: {offer.status}</span>
              </div>
            )}
            {offer.expiryDate && (
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="w-4 h-4 mr-2" />
                Expires {new Date(offer.expiryDate).toLocaleDateString()}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {offer.code && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center"><Tag className="w-5 h-5 mr-2 text-spring-green-600"/> Promo Code</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between bg-monkeyYellow-light border-2 border-dashed border-monkeyYellow p-4 rounded-lg">
              <span className="font-mono text-xl font-bold text-yellow-800">{offer.code}</span>
              <Button size="sm" variant="ghost" onClick={copyCode} className="text-yellow-800 hover:bg-monkeyYellow/40">
                <Copy className="w-4 h-4 mr-2"/>
                Copy
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {(offer.longOffer && offer.longOffer !== offer.description) && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Details</CardTitle></CardHeader>
          <CardContent className="prose prose-sm text-gray-700 max-w-none">
            <p>{stripHtmlTags(offer.longOffer)}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="text-lg">Additional Info</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <InfoRow icon={Grid} label="Categories" value={offer.categories} />
          <InfoRow icon={MapPin} label="Location" value={offer.location?.address} />
          <InfoRow icon={Info} label="Offer Type" value={offer.offerType} />
          <InfoRow icon={Tag} label="Offer Value" value={offer.offerValue} />
        </CardContent>
      </Card>
    </div>
  );
};

export default OfferInfo;
