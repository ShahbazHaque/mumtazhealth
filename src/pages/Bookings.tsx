import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, Calendar, Clock, DollarSign, Users, Check } from "lucide-react";

interface Service {
  id: string;
  title: string;
  description: string;
  category: string;
  duration_days: number | null;
  duration_hours: number | null;
  price: number;
  currency: string;
  max_capacity: number | null;
}

interface Booking {
  id: string;
  service_id: string;
  booking_date: string;
  status: string;
  notes: string | null;
  created_at: string;
  services: Service;
}

export default function Bookings() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<Service[]>([]);
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (!session) {
        navigate("/auth");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      loadServices();
      loadMyBookings();
    }
  }, [user]);

  const loadServices = async () => {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('is_active', true)
      .order('category', { ascending: true });
    
    if (error) {
      console.error('Error loading services:', error);
      toast.error('Failed to load services');
      return;
    }
    
    setServices(data || []);
  };

  const loadMyBookings = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('bookings')
      .select('*, services(*)')
      .eq('user_id', user.id)
      .order('booking_date', { ascending: false });
    
    if (error) {
      console.error('Error loading bookings:', error);
      toast.error('Failed to load your bookings');
      return;
    }
    
    setMyBookings(data || []);
  };

  const handleBookService = (service: Service) => {
    setSelectedService(service);
    setBookingDate('');
    setBookingNotes('');
    setIsDialogOpen(true);
  };

  const confirmBooking = async () => {
    if (!user || !selectedService || !bookingDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    const { data: bookingData, error } = await supabase
      .from('bookings')
      .insert({
        user_id: user.id,
        service_id: selectedService.id,
        booking_date: new Date(bookingDate).toISOString(),
        notes: bookingNotes || null,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating booking:', error);
      toast.error('Failed to create booking');
      return;
    }

    // Send admin notification email
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('username')
        .eq('user_id', user.id)
        .single();

      await supabase.functions.invoke('send-booking-email', {
        body: {
          type: 'admin_notification',
          bookingId: bookingData?.id,
          userEmail: user.email,
          userName: profileData?.username || user.email?.split('@')[0] || 'User',
          serviceTitle: selectedService.title,
          bookingDate: new Date(bookingDate).toLocaleString(),
          duration: selectedService.duration_days 
            ? `${selectedService.duration_days} days` 
            : `${selectedService.duration_hours} hours`,
          price: `${selectedService.currency} ${selectedService.price}`,
          notes: bookingNotes || undefined,
          adminEmail: 'admin@holistic-wellness.com',
        },
      });
    } catch (emailError) {
      console.error('Error sending email:', emailError);
    }

    toast.success('Booking request submitted! We will confirm shortly.');
    setIsDialogOpen(false);
    loadMyBookings();
  };

  const cancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    // Get booking details for email
    const booking = myBookings.find(b => b.id === bookingId);
    if (!booking) return;

    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId);

    if (error) {
      console.error('Error cancelling booking:', error);
      toast.error('Failed to cancel booking');
      return;
    }

    // Send cancellation email
    if (user) {
      try {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('username')
          .eq('user_id', user.id)
          .single();

        await supabase.functions.invoke('send-booking-email', {
          body: {
            type: 'cancelled',
            bookingId: booking.id,
            userEmail: user.email,
            userName: profileData?.username || user.email?.split('@')[0] || 'User',
            serviceTitle: booking.services.title,
            bookingDate: new Date(booking.booking_date).toLocaleString(),
          },
        });
      } catch (emailError) {
        console.error('Error sending email:', emailError);
      }
    }

    toast.success('Booking cancelled');
    loadMyBookings();
  };

  const getServicesByCategory = (category: string) => {
    return services.filter(s => s.category === category);
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      consultation: 'Consultations',
      workshop: 'Workshops',
      retreat: 'Retreats',
      training: 'Teacher Training',
    };
    return labels[category] || category;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-wellness-beige">
        <div className="text-wellness-taupe text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-wellness-beige">
      <div className="max-w-6xl mx-auto p-4 pb-8">
        {/* Header */}
        <Card className="mb-6 bg-wellness-warm border-wellness-taupe/20 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/")}
                  className="text-wellness-taupe"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Tracker
                </Button>
                <CardTitle className="text-2xl font-bold text-wellness-taupe">
                  Book Services
                </CardTitle>
              </div>
            </div>
            <CardDescription>
              Deep consultations, workshops, retreats, and teacher training programs
            </CardDescription>
          </CardHeader>
        </Card>

        <Tabs defaultValue="services" className="space-y-6">
          <TabsList>
            <TabsTrigger value="services">Browse Services</TabsTrigger>
            <TabsTrigger value="mybookings">My Bookings ({myBookings.length})</TabsTrigger>
          </TabsList>

          {/* Browse Services */}
          <TabsContent value="services" className="space-y-6">
            {['consultation', 'workshop', 'retreat', 'training'].map(category => {
              const categoryServices = getServicesByCategory(category);
              if (categoryServices.length === 0) return null;

              return (
                <div key={category}>
                  <h2 className="text-2xl font-bold text-wellness-taupe mb-4">
                    {getCategoryLabel(category)}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {categoryServices.map(service => (
                      <Card key={service.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <CardTitle className="text-lg">{service.title}</CardTitle>
                          <CardDescription className="text-sm">
                            {service.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              {service.duration_hours && (
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {service.duration_hours} hours
                                </div>
                              )}
                              {service.duration_days && (
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  {service.duration_days} days
                                </div>
                              )}
                              {service.max_capacity && (
                                <div className="flex items-center gap-1">
                                  <Users className="w-4 h-4" />
                                  Max {service.max_capacity}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="text-2xl font-bold text-wellness-taupe flex items-center gap-1">
                                <DollarSign className="w-5 h-5" />
                                {service.price.toFixed(2)}
                              </div>
                              <Button 
                                onClick={() => handleBookService(service)}
                                className="bg-wellness-taupe hover:bg-wellness-taupe/90"
                              >
                                Book Now
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </TabsContent>

          {/* My Bookings */}
          <TabsContent value="mybookings">
            {myBookings.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground mb-4">You haven't made any bookings yet</p>
                  <Button onClick={() => document.querySelector<HTMLButtonElement>('[value="services"]')?.click()}>
                    Browse Services
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {myBookings.map(booking => (
                  <Card key={booking.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{booking.services.title}</CardTitle>
                          <CardDescription>
                            {new Date(booking.booking_date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </CardDescription>
                        </div>
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                          {booking.services.description}
                        </p>
                        {booking.notes && (
                          <div className="bg-muted p-3 rounded-md">
                            <p className="text-sm"><strong>Your notes:</strong> {booking.notes}</p>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          {booking.status === 'confirmed' && (
                            <Badge className="bg-green-100 text-green-800">
                              <Check className="w-3 h-3 mr-1" />
                              Confirmed
                            </Badge>
                          )}
                          {booking.status === 'pending' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => cancelBooking(booking.id)}
                            >
                              Cancel Booking
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Booking Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Book {selectedService?.title}</DialogTitle>
              <DialogDescription>
                Choose your preferred date and add any notes
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="booking-date">Preferred Date *</Label>
                <Input
                  id="booking-date"
                  type="datetime-local"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="mt-2"
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>
              <div>
                <Label htmlFor="booking-notes">Additional Notes (Optional)</Label>
                <Textarea
                  id="booking-notes"
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                  placeholder="Any specific requirements or questions..."
                  className="mt-2"
                  rows={4}
                />
              </div>
              {selectedService && (
                <div className="bg-muted p-4 rounded-md">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total:</span>
                    <span className="text-xl font-bold text-wellness-taupe">
                      ${selectedService.price.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={confirmBooking}
                className="bg-wellness-taupe hover:bg-wellness-taupe/90"
              >
                Confirm Booking
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}