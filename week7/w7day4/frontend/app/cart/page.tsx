'use client';

import { Box, Typography, Container, IconButton, Button, Divider, CircularProgress } from '@mui/material';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import { 
  useGetCartQuery, 
  useUpdateCartItemMutation, 
  useRemoveFromCartMutation 
} from '../../services/api';

export default function CartPage() {
  const sessionId = "default-session";
  const { data: cart, isLoading } = useGetCartQuery(sessionId);
  const [updateQuantity] = useUpdateCartItemMutation();
  const [removeItem] = useRemoveFromCartMutation();

  const handleIncrease = (productId: string, currentQty: number) => {
    updateQuantity({ sessionId, productId, quantity: currentQty + 1 });
  };

  const handleDecrease = (productId: string, currentQty: number) => {
    if (currentQty > 1) {
      updateQuantity({ sessionId, productId, quantity: currentQty - 1 });
    } else {
      removeItem({ sessionId, productId });
    }
  };

  const handleRemove = (productId: string) => {
    removeItem({ sessionId, productId });
  };

  const cartItems = cart?.items || [];
  const subtotal = cartItems.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);

  return (
    <>
      <Navbar />
      <Container maxWidth="lg" sx={{ py: 8, minHeight: "75vh" }}>
        <Typography 
          sx={{ 
            fontFamily: "var(--font-montserrat)", 
            fontWeight: 900, 
            fontStyle: "italic",
            fontSize: { xs: "32px", md: "48px" },
            textTransform: "uppercase",
            mb: 6
          }}
        >
          Your Cart
        </Typography>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            <CircularProgress color="inherit" />
          </Box>
        ) : cartItems.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 10, backgroundColor: "#F9F9F9", borderRadius: "24px" }}>
             <Typography sx={{ fontFamily: "var(--font-montserrat)", fontSize: "20px", color: "#999", mb: 4 }}>
               Your selection is waiting for you.
             </Typography>
             <Button 
               component="a" 
               href="/"
               sx={{ 
                 backgroundColor: "#000", 
                 color: "#fff", 
                 px: 4, 
                 py: 1.5, 
                 borderRadius: "30px",
                 fontFamily: "var(--font-montserrat)",
                 fontWeight: 700,
                 '&:hover': { backgroundColor: "#333" }
               }}
             >
               Go Shopping
             </Button>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 8 }}>
            
            {/* Cart Items List */}
            <Box sx={{ flex: 2, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {cartItems.map((item: any) => (
                <Box 
                  key={item.productId} 
                  sx={{ 
                    display: 'flex', 
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 3, 
                    p: 3, 
                    border: '1px solid #F0F0F0', 
                    borderRadius: '24px',
                    transition: 'all 0.2s ease',
                    '&:hover': { borderColor: '#CCC' }
                  }}
                >
                  {/* Image */}
                  <Box 
                    sx={{ 
                      width: { xs: '100%', sm: '180px' }, 
                      height: '180px', 
                      backgroundColor: '#F5F5F5', 
                      borderRadius: '16px',
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }} 
                  >
                    {item.image ? (
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        style={{ width: "95%", height: "95%", objectFit: "contain" }}
                      />
                    ) : (
                      <Typography sx={{ fontSize: "40px" }}>🚲</Typography>
                    )}
                  </Box>
                  
                  {/* Details */}
                  <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography sx={{ fontFamily: "var(--font-montserrat)", fontWeight: 700, fontSize: "20px", mb: 0.5 }}>
                          {item.name}
                        </Typography>
                        <Typography sx={{ fontFamily: "var(--font-montserrat)", color: "#888", fontSize: "14px", textTransform: "uppercase", letterSpacing: "1px" }}>
                          Premium Collection
                        </Typography>
                      </Box>
                      <Typography sx={{ fontFamily: "var(--font-montserrat)", fontWeight: 800, fontSize: "20px" }}>
                         ${item.price?.toFixed(2)}
                      </Typography>
                    </Box>

                    {/* Controls */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 4 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, backgroundColor: "#F5F5F3", borderRadius: '40px', px: 2, py: 1 }}>
                        <IconButton size="small" onClick={() => handleDecrease(item.productId, item.quantity)} sx={{ backgroundColor: "#FFF", boxShadow: "0 2px 5px rgba(0,0,0,0.05)" }}>
                          <RemoveIcon fontSize="small" />
                        </IconButton>
                        <Typography sx={{ fontFamily: "var(--font-montserrat)", fontWeight: 700, minWidth: "24px", textAlign: "center", fontSize: "18px" }}>
                          {item.quantity}
                        </Typography>
                        <IconButton size="small" onClick={() => handleIncrease(item.productId, item.quantity)} sx={{ backgroundColor: "#FFF", boxShadow: "0 2px 5px rgba(0,0,0,0.05)" }}>
                          <AddIcon fontSize="small" />
                        </IconButton>
                      </Box>
                      
                      <IconButton onClick={() => handleRemove(item.productId)} sx={{ color: "#CCC", '&:hover': { color: "#FF3939", backgroundColor: "#FFF0F0" } }}>
                        <DeleteOutlineIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>

            {/* Summary Sidebar */}
            <Box sx={{ flex: 1 }}>
              <Box sx={{ backgroundColor: "#F9F9F9", p: 4, borderRadius: "24px", position: "sticky", top: "40px" }}>
                <Typography sx={{ fontFamily: "var(--font-montserrat)", fontWeight: 800, fontSize: "24px", mb: 4, textTransform: "uppercase" }}>
                  Summary
                </Typography>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2.5 }}>
                  <Typography sx={{ fontFamily: "var(--font-montserrat)", color: "#666" }}>Subtotal</Typography>
                  <Typography sx={{ fontFamily: "var(--font-montserrat)", fontWeight: 600 }}>${subtotal.toFixed(2)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
                  <Typography sx={{ fontFamily: "var(--font-montserrat)", color: "#666" }}>Delivery</Typography>
                  <Typography sx={{ fontFamily: "var(--font-montserrat)", fontWeight: 700, color: "#2E7D32" }}>FREE</Typography>
                </Box>

                <Divider sx={{ mb: 4 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 6 }}>
                  <Typography sx={{ fontFamily: "var(--font-montserrat)", fontWeight: 800, fontSize: "22px" }}>Total</Typography>
                  <Typography sx={{ fontFamily: "var(--font-montserrat)", fontWeight: 800, fontSize: "22px" }}>${subtotal.toFixed(2)}</Typography>
                </Box>

                <Button 
                  fullWidth 
                  variant="contained" 
                  sx={{ 
                    backgroundColor: "#000000", 
                    color: "#FFFFFF", 
                    py: 2.5, 
                    borderRadius: "40px",
                    fontFamily: "var(--font-montserrat)",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    fontSize: "16px",
                    letterSpacing: "1px",
                    '&:hover': { backgroundColor: "#333333" },
                    '&:disabled': { backgroundColor: "#CCCCCC", color: "#666666" }
                  }}
                  disabled={cartItems.length === 0}
                >
                  Confirm Order
                </Button>
                
                <Typography sx={{ fontFamily: "var(--font-montserrat)", fontSize: "12px", color: "#999", textAlign: "center", mt: 3 }}>
                  Taxes and duties included in total price
                </Typography>
              </Box>
            </Box>
          </Box>
        )}
      </Container>
      <Footer />
    </>
  );
}
