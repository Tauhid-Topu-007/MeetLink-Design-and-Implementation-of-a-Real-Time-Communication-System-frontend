import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, UserPlus, Search, Mail, Phone, Video, Trash2, 
  Edit, Star, StarOff, MessageCircle, MoreVertical 
} from 'lucide-react';
import toast from 'react-hot-toast';

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newContact, setNewContact] = useState({
    name: '',
    email: '',
    phone: '',
    avatar: '',
    favorite: false
  });

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = () => {
    const saved = localStorage.getItem('contacts');
    if (saved) {
      setContacts(JSON.parse(saved));
    } else {
      // Sample contacts
      const sampleContacts = [
        { id: 1, name: 'John Doe', email: 'john@example.com', phone: '+1234567890', favorite: true, online: true, lastSeen: new Date() },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '+1234567891', favorite: false, online: false, lastSeen: new Date() },
        { id: 3, name: 'Mike Johnson', email: 'mike@example.com', phone: '+1234567892', favorite: true, online: true, lastSeen: new Date() }
      ];
      setContacts(sampleContacts);
      localStorage.setItem('contacts', JSON.stringify(sampleContacts));
    }
  };

  const saveContacts = (updatedContacts) => {
    localStorage.setItem('contacts', JSON.stringify(updatedContacts));
    setContacts(updatedContacts);
  };

  const handleAddContact = () => {
    if (!newContact.name || !newContact.email) {
      toast.error('Name and email are required');
      return;
    }

    const contact = {
      id: Date.now(),
      ...newContact,
      online: false,
      lastSeen: new Date()
    };

    const updated = [...contacts, contact];
    saveContacts(updated);
    setShowAddForm(false);
    setNewContact({ name: '', email: '', phone: '', avatar: '', favorite: false });
    toast.success('Contact added successfully');
  };

  const handleDeleteContact = (id) => {
    const updated = contacts.filter(c => c.id !== id);
    saveContacts(updated);
    toast.success('Contact deleted');
  };

  const toggleFavorite = (id) => {
    const updated = contacts.map(c => 
      c.id === id ? { ...c, favorite: !c.favorite } : c
    );
    saveContacts(updated);
  };

  const startVideoCall = (contact) => {
    // Generate a meeting ID and navigate to meeting
    const meetingId = Math.random().toString(36).substr(2, 9).toUpperCase();
    toast.success(`Starting video call with ${contact.name}`);
    window.location.href = `/meeting/${meetingId}?callWith=${contact.name}`;
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const favorites = filteredContacts.filter(c => c.favorite);
  const others = filteredContacts.filter(c => !c.favorite);

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Contacts</h1>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2"
          >
            <UserPlus className="w-5 h-5" />
            Add Contact
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search contacts..."
            className="w-full pl-10 pr-4 py-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Add Contact Form */}
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 rounded-xl p-6 mb-6"
          >
            <h2 className="text-2xl font-semibold mb-4">Add New Contact</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name *</label>
                <input
                  type="text"
                  value={newContact.name}
                  onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-700 rounded-lg"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email *</label>
                <input
                  type="email"
                  value={newContact.email}
                  onChange={(e) => setNewContact({...newContact, email: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-700 rounded-lg"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Phone</label>
                <input
                  type="tel"
                  value={newContact.phone}
                  onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-700 rounded-lg"
                  placeholder="+1234567890"
                />
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newContact.favorite}
                    onChange={(e) => setNewContact({...newContact, favorite: e.target.checked})}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Add to favorites</span>
                </label>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleAddContact}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg"
              >
                Add Contact
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}

        {/* Favorites Section */}
        {favorites.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Favorites
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {favorites.map(contact => (
                <ContactCard
                  key={contact.id}
                  contact={contact}
                  onDelete={handleDeleteContact}
                  onToggleFavorite={toggleFavorite}
                  onCall={startVideoCall}
                />
              ))}
            </div>
          </div>
        )}

        {/* All Contacts */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            All Contacts ({others.length})
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {others.map(contact => (
              <ContactCard
                key={contact.id}
                contact={contact}
                onDelete={handleDeleteContact}
                onToggleFavorite={toggleFavorite}
                onCall={startVideoCall}
              />
            ))}
          </div>
        </div>

        {filteredContacts.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No contacts found</p>
          </div>
        )}
      </div>
    </div>
  );
};

const ContactCard = ({ contact, onDelete, onToggleFavorite, onCall }) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gray-800 rounded-xl p-4 hover:bg-gray-700 transition relative"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
              {contact.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">{contact.name}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Mail className="w-3 h-3" />
                <span className="text-xs">{contact.email}</span>
              </div>
              {contact.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                  <Phone className="w-3 h-3" />
                  <span className="text-xs">{contact.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 hover:bg-gray-600 rounded"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          
          {showMenu && (
            <div className="absolute right-0 top-6 bg-gray-700 rounded-lg shadow-xl py-1 z-10 min-w-[120px]">
              <button
                onClick={() => {
                  onToggleFavorite(contact.id);
                  setShowMenu(false);
                }}
                className="w-full px-3 py-2 text-left hover:bg-gray-600 flex items-center gap-2 text-sm"
              >
                {contact.favorite ? <StarOff className="w-4 h-4" /> : <Star className="w-4 h-4" />}
                {contact.favorite ? 'Remove Favorite' : 'Add Favorite'}
              </button>
              <button
                onClick={() => {
                  onDelete(contact.id);
                  setShowMenu(false);
                }}
                className="w-full px-3 py-2 text-left hover:bg-gray-600 flex items-center gap-2 text-sm text-red-500"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex gap-2 mt-4">
        <button
          onClick={() => onCall(contact)}
          className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center justify-center gap-2 text-sm"
        >
          <Video className="w-4 h-4" />
          Video Call
        </button>
        <button
          className="flex-1 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg flex items-center justify-center gap-2 text-sm"
        >
          <MessageCircle className="w-4 h-4" />
          Message
        </button>
      </div>
      
      <div className="mt-2 flex items-center gap-1">
        <div className={`w-2 h-2 rounded-full ${contact.online ? 'bg-green-500' : 'bg-gray-500'}`} />
        <span className="text-xs text-gray-400">
          {contact.online ? 'Online' : `Last seen ${new Date(contact.lastSeen).toLocaleDateString()}`}
        </span>
      </div>
    </motion.div>
  );
};

export default Contacts;