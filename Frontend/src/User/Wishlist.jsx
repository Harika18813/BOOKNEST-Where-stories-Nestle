import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Unavbar from './Unavbar';

function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [items, setItems] = useState({});  // Store item details

  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (user) {
      fetchWishlist();
    } else {
      console.log('User not logged in');
    }
  }, []);

  const fetchWishlist = async () => {
    try {
      const response = await axios.get(`http://localhost:4000/wishlist/${user.id}`);
      setWishlist(response.data);

      // Fetch item details for each wishlist item
      const itemDetails = {};
      for (let wItem of response.data) {
        const res = await axios.get(`http://localhost:4000/item/${wItem.itemId}`);
        itemDetails[wItem.itemId] = res.data;
      }
      setItems(itemDetails);
    } catch (error) {
      console.error('Error fetching wishlist: ', error);
    }
  };

  const removeFromWishlist = async (itemId) => {
    try {
      await axios.post(`http://localhost:4000/wishlist/remove`, { itemId, userId: user.id });
      fetchWishlist();
    } catch (error) {
      console.error('Error removing item from wishlist: ', error);
    }
  };

  return (
    <div>
      <Unavbar />
      <div className="container mx-auto p-8">
        <h2 className="text-3xl font-semibold mb-4 text-center">Wishlist</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {wishlist.map((item) => {
            const details = items[item.itemId]; // Fetch full item details

            if (!details) return null; // skip until loaded

            return (
              <div key={item._id} className="bg-white p-4 rounded shadow">
                <img
                  src={`http://localhost:4000/${details.itemImage}`}
                  alt="Item"
                  className="rounded-t-lg"
                  style={{ height: '350px', width: '500px' }}
                />
                <div>
                  <p className="text-xl font-bold mb-2">{details.title}</p>
                  <p className="text-gray-700 mb-2">Author: {details.author}</p>
                  <p className="text-gray-700 mb-2">Genre: {details.genre}</p>
                  <p className="text-blue-500 font-bold">Price: ₹{details.price}</p>

                  <Button
                    style={{ backgroundColor: 'red', border: 'none' }}
                    onClick={() => removeFromWishlist(item.itemId)}
                  >
                    Remove from Wishlist
                  </Button>

                  <Button style={{ backgroundColor: 'rebeccapurple', border: 'none', marginLeft: '10px' }}>
                    <Link
                      to={`/uitem/${item.itemId}`}
                      style={{ color: 'white', textDecoration: 'none' }}
                    >
                      View
                    </Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Wishlist;
