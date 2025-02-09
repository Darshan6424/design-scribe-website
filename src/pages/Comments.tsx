
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MessageSquare, Maximize2, MapPin, User, ArrowLeft } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import LocationPicker from "@/components/LocationPicker";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  image_url: string | null;
  latitude: number | null;
  longitude: number | null;
  location_name: string | null;
  likes: number;
  user_id: string;
  user_likes: string[];
  profiles: {
    username: string | null;
  } | null;
}

const Comments = () => {
  const [selectedMapComment, setSelectedMapComment] = useState<number | null>(null);
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: comments = [], isLoading } = useQuery<Comment[]>({
    queryKey: ['missingPersonComments', id],
    queryFn: async () => {
      if (!id) throw new Error('Missing person ID is required');
      
      const { data, error } = await supabase
        .from('missing_person_comments')
        .select(`
          *,
          profiles (username)
        `)
        .eq('missing_person_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!id
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <Button
            onClick={() => navigate(`/detailed-report/${id}`)}
            variant="ghost"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Report
          </Button>
        </div>

        <h2 className="text-2xl font-bold mb-6 text-center">Previous Comments:</h2>
        
        <div className="space-y-12">
          {comments.map((comment, index) => (
            <div key={comment.id} className="relative pl-12 border-b pb-8 last:border-0">
              <div className="absolute -left-2 top-0 w-8 h-8 bg-[#ea384c] text-white rounded-full flex items-center justify-center font-bold">
                {index + 1}
              </div>
              
              <div className="grid md:grid-cols-[1fr,300px] gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Comment Information</h4>
                    <p className="text-gray-700 bg-white p-4 rounded-lg shadow-sm">
                      {comment.content}
                    </p>
                  </div>
                  
                  {(comment.latitude && comment.longitude) && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Location Details</h4>
                      <div className="relative">
                        <div className="h-[200px] rounded-lg overflow-hidden">
                          <LocationPicker
                            onLocationSelected={() => {}}
                            initialLat={Number(comment.latitude)}
                            initialLng={Number(comment.longitude)}
                            readOnly={true}
                            markers={[
                              {
                                lat: Number(comment.latitude),
                                lng: Number(comment.longitude),
                                popup: `<strong>Location:</strong> ${comment.location_name || 'Unknown location'}<br/><strong>Comment:</strong> ${comment.content}`
                              }
                            ]}
                          />
                        </div>
                        <button
                          onClick={() => setSelectedMapComment(index)}
                          className="absolute top-2 right-2 p-1 bg-white rounded-md shadow-sm hover:bg-gray-50 transition-colors"
                        >
                          <Maximize2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-end gap-2 text-sm text-gray-500">
                    <User className="h-4 w-4" />
                    <span>{comment.profiles?.username || 'Anonymous'}</span>
                    <span>•</span>
                    <span>{new Date(comment.created_at).toLocaleString()}</span>
                  </div>
                </div>
                
                {comment.image_url && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Attached Image</h4>
                    <div className="h-[200px] rounded-lg overflow-hidden bg-white shadow-sm">
                      <img 
                        src={comment.image_url}
                        alt="Comment attachment"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <Dialog open={selectedMapComment !== null} onOpenChange={() => setSelectedMapComment(null)}>
          <DialogContent className="max-w-4xl">
            <div className="h-[600px]">
              {selectedMapComment !== null && comments[selectedMapComment] && (
                <LocationPicker
                  onLocationSelected={() => {}}
                  initialLat={Number(comments[selectedMapComment].latitude)}
                  initialLng={Number(comments[selectedMapComment].longitude)}
                  readOnly={true}
                  markers={[
                    {
                      lat: Number(comments[selectedMapComment].latitude),
                      lng: Number(comments[selectedMapComment].longitude),
                      popup: `<strong>Location:</strong> ${comments[selectedMapComment].location_name || 'Unknown location'}<br/><strong>Comment:</strong> ${comments[selectedMapComment].content}`
                    }
                  ]}
                />
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Comments;

