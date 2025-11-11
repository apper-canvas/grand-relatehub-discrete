import { toast } from 'react-toastify';
import React from 'react';
import { getApperClient } from '@/services/apperClient';
import Error from '@/components/ui/Error';

class QuoteService {
  constructor() {
    this.tableName = 'quote_c';
    this.updateableFields = [
      'Name', 'Tags', 'company_c', 'contact_id_c', 'deal_id_c', 
      'quote_date_c', 'status_c', 'delivery_method_c', 'expires_on_c',
      'billing_name_c', 'billing_street_c', 'billing_city_c', 
      'billing_state_c', 'billing_country_c', 'billing_pincode_c',
      'shipping_name_c', 'shipping_street_c', 'shipping_city_c',
      'shipping_state_c', 'shipping_country_c', 'shipping_pincode_c'
    ];
    this.allFields = [
      'Id', 'Name', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 
      'ModifiedOn', 'ModifiedBy', 'company_c', 'contact_id_c', 'deal_id_c',
      'quote_date_c', 'status_c', 'delivery_method_c', 'expires_on_c',
      'billing_name_c', 'billing_street_c', 'billing_city_c',
      'billing_state_c', 'billing_country_c', 'billing_pincode_c',
      'shipping_name_c', 'shipping_street_c', 'shipping_city_c',
      'shipping_state_c', 'shipping_country_c', 'shipping_pincode_c'
    ];
  }

  async getAll(filters = {}) {
    try {
      const apperClient = getApperClient();
      const params = {
        fields: this.allFields.map(field => ({"field": {"Name": field}})),
        orderBy: [{"fieldName": "ModifiedOn", "sorttype": "DESC"}],
        pagingInfo: { limit: 50, offset: 0 }
      };

      // Add search filter if provided
      if (filters.search) {
        params.where = [{
          "FieldName": "Name",
          "Operator": "Contains",
          "Values": [filters.search],
          "Include": true
        }];
      }

      // Add status filter if provided
      if (filters.status) {
        const statusFilter = {
          "FieldName": "status_c",
          "Operator": "EqualTo",
          "Values": [filters.status],
          "Include": true
        };
        
        if (params.where) {
          params.where.push(statusFilter);
        } else {
          params.where = [statusFilter];
        }
      }

      const response = await apperClient.fetchRecords(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching quotes:", error?.response?.data?.message || error);
      toast.error('Failed to fetch quotes');
      return [];
    }
  }

  async getById(id) {
    try {
      const apperClient = getApperClient();
      const params = {
        fields: this.allFields.map(field => ({"field": {"Name": field}}))
      };

      const response = await apperClient.getRecordById(this.tableName, id, params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching quote ${id}:`, error?.response?.data?.message || error);
      toast.error('Failed to fetch quote details');
      return null;
    }
  }

  async create(quoteData) {
    try {
      const apperClient = getApperClient();
      
      // Filter to only updateable fields
      const filteredData = {};
      this.updateableFields.forEach(field => {
        if (quoteData[field] !== undefined && quoteData[field] !== null && quoteData[field] !== '') {
          if (field === 'contact_id_c' || field === 'deal_id_c') {
            // Handle lookup fields - convert to integer
            filteredData[field] = parseInt(quoteData[field]);
          } else {
            filteredData[field] = quoteData[field];
          }
        }
      });

      const params = {
        records: [filteredData]
      };

      const response = await apperClient.createRecord(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} quotes:${failed}`);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
          return null;
        }

        if (successful.length > 0) {
          toast.success('Quote created successfully');
          return successful[0].data;
        }
      }

      return null;
    } catch (error) {
      console.error("Error creating quote:", error?.response?.data?.message || error);
      toast.error('Failed to create quote');
      return null;
    }
  }

  async update(id, quoteData) {
    try {
      const apperClient = getApperClient();
      
      // Filter to only updateable fields
      const filteredData = { Id: parseInt(id) };
      this.updateableFields.forEach(field => {
        if (quoteData[field] !== undefined && quoteData[field] !== null && quoteData[field] !== '') {
          if (field === 'contact_id_c' || field === 'deal_id_c') {
            // Handle lookup fields - convert to integer
            filteredData[field] = parseInt(quoteData[field]);
          } else {
            filteredData[field] = quoteData[field];
          }
        }
      });

      const params = {
        records: [filteredData]
      };

      const response = await apperClient.updateRecord(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} quotes:${failed}`);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
          return null;
        }

        if (successful.length > 0) {
          toast.success('Quote updated successfully');
          return successful[0].data;
        }
      }

      return null;
    } catch (error) {
      console.error("Error updating quote:", error?.response?.data?.message || error);
      toast.error('Failed to update quote');
      return null;
    }
  }

  async delete(id) {
    try {
      const apperClient = getApperClient();
      const params = {
        RecordIds: [parseInt(id)]
      };

      const response = await apperClient.deleteRecord(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} quotes:${failed}`);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          return false;
        }

        if (successful.length > 0) {
          toast.success('Quote deleted successfully');
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error("Error deleting quote:", error?.response?.data?.message || error);
      toast.error('Failed to delete quote');
      return false;
    }
  }
}

export const quoteService = new QuoteService();