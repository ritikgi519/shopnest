import React from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCatalog from '../components/ProductCatalog';

const Catalog = () => {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('q') || searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || 'All';

  return (
    <div className="catalog-page" style={{ minHeight: '80vh', padding: '20px 0' }}>
      <ProductCatalog 
        apiUrl="/api/products"
        title="Product Catalog"
        subtitle="Explore our comprehensive inventory with real-time stock levels, high-definition galleries, and direct checkout."
        showFilters={true}
        showSearch={true}
        initialSearch={initialSearch}
        initialCategory={initialCategory}
      />
    </div>
  );
};

export default Catalog;
