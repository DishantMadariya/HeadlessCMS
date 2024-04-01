'use client'
import axios from "axios";
import { ReactNode, useEffect, useState } from "react";

interface RouteParams {
    category: string;
}

interface Category {
    id: number;
    name: string;
    slug: string;
    images: [
        {
            src: string,
        }
    ]
    _links: {
        self: [{ href: string }];
    };
    regular_price: number;
    sale_price: number;
}
interface Product {
    id: number;
    name: string;
    slug: string;
    images: [
        {
            src: string,
        }
    ]
    _links: {
        self: [{ href: string }];
    };
    regular_price: number;
    sale_price: number;
}
export default function ProductDetails({ params }: { params: RouteParams }): ReactNode {
    const [parentCate, setParentCate] = useState<Category[]>([]);
    const [subCate, setSubCate] = useState<Category[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const parentResponse = await axios.get<Category[]>(`https://localhost/wordpress/wp-json/wc/v3/products/categories?slug=${params.category}`, {
                    headers: {
                        'Authorization': 'Basic Y2tfZDZjODcyODlhYWQzZTczMzFkOWVhMmE1NGYwZDA5ZGQ2YTc0ZjdiMDpjc18zZGJhMGNmY2RhZjhiMjE1ODg3YTZhNDdlNWJjM2I1OGFjMzNiOTBk'
                    }
                });

                setParentCate(parentResponse.data);

                if (parentResponse.data.length > 0) {
                    const parentId = parentResponse.data[0].id;
                    const subResponse = await axios.get<Category[]>(`https://localhost/wordpress/wp-json/wc/v3/products/categories?parent=${parentId}`, {
                        headers: {
                            'Authorization': 'Basic Y2tfZDZjODcyODlhYWQzZTczMzFkOWVhMmE1NGYwZDA5ZGQ2YTc0ZjdiMDpjc18zZGJhMGNmY2RhZjhiMjE1ODg3YTZhNDdlNWJjM2I1OGFjMzNiOTBk'
                        }
                    });

                    setSubCate(subResponse.data);

                    if (subResponse.data.length > 0) {
                        const categoryIds = subResponse.data.map(category => category.id); 
                        const productResponse = await axios.get(`https://localhost/wordpress/wp-json/wc/v3/products`, {
                            headers: {
                                'Authorization': 'Basic Y2tfZDZjODcyODlhYWQzZTczMzFkOWVhMmE1NGYwZDA5ZGQ2YTc0ZjdiMDpjc18zZGJhMGNmY2RhZjhiMjE1ODg3YTZhNDdlNWJjM2I1OGFjMzNiOTBk'
                            }
                        });
                        console.log(productResponse.data);
                        //set loop 
                        // Filter products based on category IDs
                        const filteredProducts = productResponse.data.filter((product: { categories: any[]; }) =>
                            product.categories.some(category => categoryIds.includes(category.id))
                        );
                        console.log(filteredProducts);

                        setFilteredProducts(filteredProducts);
                    }
                }
            } catch (error) {
                console.log("Error fetching data:", error);
                // Handle specific errors if needed
            }
        };

        fetchData();
    }, [params.category]);

    const replaceApiBaseUrl = (url: string, id: number) => {
        return url.replace(
            `https://localhost/wordpress/wp-json/wc/v3/products/${id}`,
            `http://localhost:3000/products/${id}`
        );
    };

    return (
        <div>
            <h2 className='text-center my-10'>Products</h2>
            <ul className='flex justify-center'>
                {filteredProducts.map((Product) => (
                    <li key={Product.id} className='mx-5 list-none text-center'>
                        <a className='text-center no-underline' href={replaceApiBaseUrl(Product._links.self[0].href, Product.id)}>
                            <img src={Product.images[0].src} className='w-80 h-52 object-cover object-center' />
                            <strong className='text-center flex justify-center'>
                                {Product.name}
                            </strong>
                            <span className='flex justify-center items-center'>
                                <p className='mx-2'><s>₹{Product.regular_price}</s></p>
                                <p>₹{Product.sale_price}</p>
                            </span>
                        </a>
                        <button type="button" className="inline-flex w-full justify-center rounded-sm bg-lime-400 px-2 py-1 text-sm font-semibold text-white shadow-sm hover:bg-lime-600 sm:ml-3 sm:w-auto">Add to cart</button>
                    </li>
                ))}
            </ul>
        </div>
    )
}