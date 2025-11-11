import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import FormField from '@/components/molecules/FormField';
import { toast } from 'react-toastify';

const QuoteModal = ({ isOpen, onClose, quote, onSave, contacts = [], deals = [] }) => {
  const [formData, setFormData] = useState({
    Name: '',
    company_c: '',
    contact_id_c: '',
    deal_id_c: '',
    quote_date_c: '',
    status_c: 'Draft',
    delivery_method_c: '',
    expires_on_c: '',
    billing_name_c: '',
    billing_street_c: '',
    billing_city_c: '',
    billing_state_c: '',
    billing_country_c: '',
    billing_pincode_c: '',
    shipping_name_c: '',
    shipping_street_c: '',
    shipping_city_c: '',
    shipping_state_c: '',
    shipping_country_c: '',
    shipping_pincode_c: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (quote) {
      setFormData({
Name: quote.Name || '',
        company_c: quote.company_c?.Name || quote.company_c || '',
contact_id_c: parseInt(quote.contact_id_c?.Id || quote.contact_id_c) || '',
        deal_id_c: parseInt(quote.deal_id_c?.Id || quote.deal_id_c) || '',
        quote_date_c: quote.quote_date_c || '',
        status_c: quote.status_c || 'Draft',
        delivery_method_c: quote.delivery_method_c || '',
        expires_on_c: quote.expires_on_c || '',
        billing_name_c: quote.billing_name_c || '',
        billing_street_c: quote.billing_street_c || '',
        billing_city_c: quote.billing_city_c || '',
        billing_state_c: quote.billing_state_c || '',
        billing_country_c: quote.billing_country_c || '',
        billing_pincode_c: quote.billing_pincode_c || '',
        shipping_name_c: quote.shipping_name_c || '',
        shipping_street_c: quote.shipping_street_c || '',
        shipping_city_c: quote.shipping_city_c || '',
        shipping_state_c: quote.shipping_state_c || '',
        shipping_country_c: quote.shipping_country_c || '',
        shipping_pincode_c: quote.shipping_pincode_c || ''
      });
    } else {
      // Reset form for new quote
      setFormData({
        Name: '',
        company_c: '',
        contact_id_c: '',
        deal_id_c: '',
        quote_date_c: new Date().toISOString().split('T')[0],
        status_c: 'Draft',
        delivery_method_c: '',
        expires_on_c: '',
        billing_name_c: '',
        billing_street_c: '',
        billing_city_c: '',
        billing_state_c: '',
        billing_country_c: '',
        billing_pincode_c: '',
        shipping_name_c: '',
        shipping_street_c: '',
        shipping_city_c: '',
        shipping_state_c: '',
        shipping_country_c: '',
        shipping_pincode_c: ''
      });
    }
    setErrors({});
  }, [quote, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.Name.trim()) {
      newErrors.Name = 'Quote name is required';
    }

    if (!formData.quote_date_c) {
      newErrors.quote_date_c = 'Quote date is required';
    }

    if (!formData.status_c) {
      newErrors.status_c = 'Status is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error saving quote:', error);
      toast.error('Failed to save quote');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const copyBillingToShipping = () => {
    setFormData(prev => ({
      ...prev,
      shipping_name_c: prev.billing_name_c,
      shipping_street_c: prev.billing_street_c,
      shipping_city_c: prev.billing_city_c,
      shipping_state_c: prev.billing_state_c,
      shipping_country_c: prev.billing_country_c,
      shipping_pincode_c: prev.billing_pincode_c
    }));
  };

  if (!isOpen) return null;

  const contactOptions = contacts.map(contact => ({
    value: contact.Id,
    label: contact.Name || contact.name_c || `Contact ${contact.Id}`
  }));

  const dealOptions = deals.map(deal => ({
    value: deal.Id,
    label: deal.Name || deal.title_c || `Deal ${deal.Id}`
  }));

  const statusOptions = [
    { value: 'Draft', label: 'Draft' },
    { value: 'Sent', label: 'Sent' },
    { value: 'Accepted', label: 'Accepted' },
    { value: 'Rejected', label: 'Rejected' }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {quote ? 'Edit Quote' : 'Create New Quote'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ApperIcon name="X" size={24} />
            </button>
          </div>

          <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Quote Name *"
                  type="text"
                  value={formData.Name}
                  onChange={(value) => handleChange('Name', value)}
                  error={errors.Name}
                  placeholder="Enter quote name"
                />
                
                <FormField
                  label="Company"
                  type="text"
                  value={formData.company_c}
                  onChange={(value) => handleChange('company_c', value)}
                  placeholder="Company name"
                />

                <FormField
                  label="Contact"
                  type="select"
                  value={formData.contact_id_c}
                  onChange={(value) => handleChange('contact_id_c', value)}
                  options={[{ value: '', label: 'Select Contact' }, ...contactOptions]}
                />

                <FormField
                  label="Deal"
                  type="select"
                  value={formData.deal_id_c}
                  onChange={(value) => handleChange('deal_id_c', value)}
                  options={[{ value: '', label: 'Select Deal' }, ...dealOptions]}
                />

                <FormField
                  label="Quote Date *"
                  type="date"
                  value={formData.quote_date_c}
                  onChange={(value) => handleChange('quote_date_c', value)}
                  error={errors.quote_date_c}
                />

                <FormField
                  label="Status *"
                  type="select"
                  value={formData.status_c}
                  onChange={(value) => handleChange('status_c', value)}
                  options={statusOptions}
                  error={errors.status_c}
                />

                <FormField
                  label="Delivery Method"
                  type="text"
                  value={formData.delivery_method_c}
                  onChange={(value) => handleChange('delivery_method_c', value)}
                  placeholder="Email, Mail, etc."
                />

                <FormField
                  label="Expires On"
                  type="date"
                  value={formData.expires_on_c}
                  onChange={(value) => handleChange('expires_on_c', value)}
                />
              </div>

              {/* Billing Address */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                  Billing Address
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="Bill To Name"
                    type="text"
                    value={formData.billing_name_c}
                    onChange={(value) => handleChange('billing_name_c', value)}
                    placeholder="Billing contact name"
                  />
                  
                  <FormField
                    label="Street"
                    type="text"
                    value={formData.billing_street_c}
                    onChange={(value) => handleChange('billing_street_c', value)}
                    placeholder="Street address"
                  />
                  
                  <FormField
                    label="City"
                    type="text"
                    value={formData.billing_city_c}
                    onChange={(value) => handleChange('billing_city_c', value)}
                    placeholder="City"
                  />
                  
                  <FormField
                    label="State"
                    type="text"
                    value={formData.billing_state_c}
                    onChange={(value) => handleChange('billing_state_c', value)}
                    placeholder="State"
                  />
                  
                  <FormField
                    label="Country"
                    type="text"
                    value={formData.billing_country_c}
                    onChange={(value) => handleChange('billing_country_c', value)}
                    placeholder="Country"
                  />
                  
                  <FormField
                    label="Pincode"
                    type="text"
                    value={formData.billing_pincode_c}
                    onChange={(value) => handleChange('billing_pincode_c', value)}
                    placeholder="Postal code"
                  />
                </div>
              </div>

              {/* Shipping Address */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                    Shipping Address
                  </h3>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={copyBillingToShipping}
                    className="text-sm"
                  >
                    Copy from Billing
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="Ship To Name"
                    type="text"
                    value={formData.shipping_name_c}
                    onChange={(value) => handleChange('shipping_name_c', value)}
                    placeholder="Shipping contact name"
                  />
                  
                  <FormField
                    label="Street"
                    type="text"
                    value={formData.shipping_street_c}
                    onChange={(value) => handleChange('shipping_street_c', value)}
                    placeholder="Street address"
                  />
                  
                  <FormField
                    label="City"
                    type="text"
                    value={formData.shipping_city_c}
                    onChange={(value) => handleChange('shipping_city_c', value)}
                    placeholder="City"
                  />
                  
                  <FormField
                    label="State"
                    type="text"
                    value={formData.shipping_state_c}
                    onChange={(value) => handleChange('shipping_state_c', value)}
                    placeholder="State"
                  />
                  
                  <FormField
                    label="Country"
                    type="text"
                    value={formData.shipping_country_c}
                    onChange={(value) => handleChange('shipping_country_c', value)}
                    placeholder="Country"
                  />
                  
                  <FormField
                    label="Pincode"
                    type="text"
                    value={formData.shipping_pincode_c}
                    onChange={(value) => handleChange('shipping_pincode_c', value)}
                    placeholder="Postal code"
                  />
                </div>
              </div>
            </form>
          </div>

          <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              loading={loading}
              className="min-w-[100px]"
            >
              {quote ? 'Update' : 'Create'} Quote
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default QuoteModal;