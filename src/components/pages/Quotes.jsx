import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import SearchBar from '@/components/molecules/SearchBar';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import QuoteModal from '@/components/organisms/QuoteModal';
import { quoteService } from '@/services/api/quoteService';
import { contactService } from '@/services/api/contactService';
import { dealService } from '@/services/api/dealService';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const Quotes = () => {
  const [quotes, setQuotes] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const statusOptions = ['Draft', 'Sent', 'Accepted', 'Rejected'];

  useEffect(() => {
    loadData();
  }, [searchQuery, statusFilter]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [quotesData, contactsData, dealsData] = await Promise.all([
        quoteService.getAll({ search: searchQuery, status: statusFilter }),
        contactService.getAll(),
        dealService.getAll()
      ]);
      
      setQuotes(quotesData);
      setContacts(contactsData);
      setDeals(dealsData);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuote = () => {
    setSelectedQuote(null);
    setIsModalOpen(true);
  };

  const handleEditQuote = (quote) => {
    setSelectedQuote(quote);
    setIsModalOpen(true);
  };

  const handleSaveQuote = async (quoteData) => {
    let result;
    if (selectedQuote) {
      result = await quoteService.update(selectedQuote.Id, quoteData);
    } else {
      result = await quoteService.create(quoteData);
    }

    if (result) {
      setIsModalOpen(false);
      loadData();
    }
  };

  const handleDeleteQuote = async (quote) => {
    if (!window.confirm(`Are you sure you want to delete "${quote.Name}"?`)) {
      return;
    }

    setIsDeleting(true);
    const success = await quoteService.delete(quote.Id);
    setIsDeleting(false);

    if (success) {
      loadData();
    }
  };

  const getContactById = (contactId) => {
    return contacts.find(contact => contact.Id === contactId);
  };

  const getDealById = (dealId) => {
    return deals.find(deal => deal.Id === dealId);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Draft': return 'bg-gray-100 text-gray-800';
      case 'Sent': return 'bg-blue-100 text-blue-800';
      case 'Accepted': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadData} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quotes</h1>
          <p className="text-gray-600 mt-1">Manage your quotes and proposals</p>
        </div>
        <Button onClick={handleAddQuote} className="flex items-center space-x-2">
          <ApperIcon name="Plus" size={16} />
          <span>Add Quote</span>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search quotes..."
          />
        </div>
        <div className="w-full sm:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">All Statuses</option>
            {statusOptions.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Quotes List */}
      {quotes.length === 0 ? (
        <Empty 
          icon="FileText" 
          title="No quotes found" 
          description={searchQuery || statusFilter ? "No quotes match your search criteria." : "Create your first quote to get started."} 
        />
      ) : (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Company</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Contact</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Deal</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Quote Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Expires On</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <AnimatePresence>
                  {quotes.map((quote) => {
                    const contact = getContactById(quote.contact_id_c?.Id || quote.contact_id_c);
                    const deal = getDealById(quote.deal_id_c?.Id || quote.deal_id_c);
                    
                    return (
                      <motion.tr
                        key={quote.Id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-gray-50"
                      >
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">{quote.Name}</div>
                          <div className="text-sm text-gray-500">{quote.delivery_method_c}</div>
                        </td>
                        <td className="py-3 px-4 text-gray-900">{quote.company_c || 'N/A'}</td>
                        <td className="py-3 px-4 text-gray-900">
                          {quote.contact_id_c?.Name || contact?.Name || 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-gray-900">
                          {quote.deal_id_c?.Name || deal?.Name || 'N/A'}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(quote.status_c)}`}>
                            {quote.status_c}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-900">{formatDate(quote.quote_date_c)}</td>
                        <td className="py-3 px-4 text-gray-900">{formatDate(quote.expires_on_c)}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleEditQuote(quote)}
                              className="text-gray-600 hover:text-primary transition-colors"
                            >
                              <ApperIcon name="Edit2" size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteQuote(quote)}
                              disabled={isDeleting}
                              className="text-gray-600 hover:text-red-600 transition-colors disabled:opacity-50"
                            >
                              <ApperIcon name="Trash2" size={16} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quote Modal */}
      <QuoteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        quote={selectedQuote}
        onSave={handleSaveQuote}
        contacts={contacts}
        deals={deals}
      />
    </div>
  );
};

export default Quotes;