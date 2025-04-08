'use client';

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSession, signIn, signOut } from "next-auth/react";
import toast from "react-hot-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star } from "lucide-react";

const menuCategories = {
  snacks: [
    { id: 1, name: "Veg Sandwich", price: 40, rating: 4.5 },
    { id: 2, name: "Maggie", price: 30, rating: 4.2 },
    { id: 3, name: "Samosa", price: 20, rating: 4.0 },
  ],
  beverages: [
    { id: 4, name: "Cold Coffee", price: 50, rating: 4.7 },
    { id: 5, name: "Tea", price: 15, rating: 4.3 },
    { id: 6, name: "Lemonade", price: 30, rating: 4.1 },
  ],
  meals: [
    { id: 7, name: "Veg Thali", price: 80, rating: 4.8 },
    { id: 8, name: "Pasta", price: 60, rating: 4.4 },
    { id: 9, name: "Burger", price: 70, rating: 4.6 },
  ],
};

export default function CampusDeliveryApp() {
  const { data: session } = useSession();
  const [cart, setCart] = useState([]);
  const [orderStatus, setOrderStatus] = useState(null);
  const [activeTab, setActiveTab] = useState("snacks");
  const [searchQuery, setSearchQuery] = useState("");

  const addToCart = (item) => {
    setCart((prev) => [...prev, item]);
    toast.success(`${item.name} added to cart!`);
  };

  const removeFromCart = (itemId) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
    toast.error("Item removed from cart");
  };

  const placeOrder = async () => {
    if (!session) {
      toast.error("Please sign in to place an order");
      return;
    }

    try {
      const response = await fetch("/api/place-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          items: cart,
          userId: session.user.id,
          userName: session.user.name
        }),
      });
      const data = await response.json();
      setOrderStatus(data.status);
      setCart([]);
      toast.success("Order placed successfully!");
    } catch (error) {
      console.error("Order error:", error);
      toast.error("Failed to place order");
    }
  };

  const filteredItems = menuCategories[activeTab].filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Campus Delivery App</h1>
          {session ? (
            <div className="flex items-center gap-4">
              <span>Welcome, {session.user.name}</span>
              <Button variant="outline" onClick={() => signOut()}>
                Sign Out
              </Button>
            </div>
          ) : (
            <Button onClick={() => signIn()}>Sign In</Button>
          )}
        </div>

        <div className="mb-6">
          <Input
            type="text"
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="snacks">Snacks</TabsTrigger>
            <TabsTrigger value="beverages">Beverages</TabsTrigger>
            <TabsTrigger value="meals">Meals</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <Card key={item.id} className="bg-gray-800 hover:bg-gray-700 transition-colors">
                  <CardContent className="p-4 flex flex-col gap-2">
                    <span className="text-xl font-semibold">{item.name}</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-yellow-400">{item.rating}</span>
                    </div>
                    <span className="text-green-400">₹{item.price}</span>
                    <Button 
                      onClick={() => addToCart(item)} 
                      className="mt-auto"
                      disabled={!session}
                    >
                      Add to Cart
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-8 bg-gray-800 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Your Cart</h2>
          {cart.length === 0 ? (
            <p className="text-gray-400">Cart is empty</p>
          ) : (
            <div>
              <ul className="space-y-2">
                {cart.map((item) => (
                  <li key={item.id} className="flex justify-between items-center">
                    <span>{item.name} - ₹{item.price}</span>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeFromCart(item.id)}
                    >
                      Remove
                    </Button>
                  </li>
                ))}
              </ul>
              <div className="mt-4">
                <p className="text-xl font-semibold">
                  Total: ₹{cart.reduce((sum, item) => sum + item.price, 0)}
                </p>
                <Button
                  onClick={placeOrder}
                  className="mt-4"
                  disabled={!session || cart.length === 0}
                >
                  Place Order
                </Button>
              </div>
            </div>
          )}
          {orderStatus && (
            <p className="mt-4 text-blue-400">Order Status: {orderStatus}</p>
          )}
        </div>
      </div>
    </div>
  );
} 