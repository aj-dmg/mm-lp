import { Bus, Driver, Booking, CorporateClient, Contact } from './types';
import { toTitleCase } from './utils';

export const BUS_COLORS: string[] = [
  '#ec4899', // brand-pink
  '#3b82f6', // brand-blue
  '#34d399', // neon-green
  '#4f46e5', // indigo-600/brand-purple
  '#e11d48', // rose-600
  '#f59e0b', // amber-500
  '#14b8a6', // teal-500
  '#f97316', // orange-500
];


export const BUSES: Bus[] = [
  {
    id: 'bus-1',
    name: '45 Passenger Party Bus',
    capacity: 45,
    imageUrl: 'https://picsum.photos/seed/bus1/600/400',
    features: ['Laser Lights', 'Premium Sound System', 'Dance Floor', 'Limo Seating', 'Dance Pole'],
    startingPrice: 300,
    color: BUS_COLORS[0],
    status: 'active',
  },
  {
    id: 'bus-2',
    name: 'Double Decker Party Bus 45+ Passengers',
    capacity: 85,
    imageUrl: 'https://picsum.photos/seed/bus2/600/400',
    features: ['Laser Lights', 'Premium Sound System', 'Dance Floor', 'Limo Seating'],
    startingPrice: 500,
    color: BUS_COLORS[1],
    status: 'active',
  },
  {
    id: 'bus-3',
    name: 'Double Decker Coach Bus',
    capacity: 80,
    imageUrl: 'https://picsum.photos/seed/bus3/600/400',
    features: ['Bluetooth Audio', 'LED Mood Lighting'],
    startingPrice: 450,
    color: BUS_COLORS[2],
    status: 'active',
  },
  {
    id: 'bus-4',
    name: 'Hi Way Coach',
    capacity: 56,
    imageUrl: 'https://picsum.photos/seed/bus4/600/400',
    features: ['Reclining Seats', 'On-board Restroom', 'PA System'],
    startingPrice: 400,
    color: BUS_COLORS[3],
    status: 'maintenance',
  },
];

export const DRIVERS: Driver[] = [
  { id: 'driver-4', name: 'AJ', imageUrl: 'https://picsum.photos/seed/driver4/100/100', phone: '555-0104', email: 'aj@example.com', status: 'active' },
  { id: 'driver-5', name: 'Blake', imageUrl: 'https://picsum.photos/seed/driver5/100/100', phone: '555-0105', email: 'blake@example.com', status: 'active' },
  { id: 'driver-6', name: 'Reza', imageUrl: 'https://picsum.photos/seed/driver6/100/100', phone: '555-0106', email: 'reza@example.com', status: 'on_leave' },
  { id: 'driver-7', name: 'Lisa', imageUrl: 'https://picsum.photos/seed/driver7/100/100', phone: '555-0107', email: 'lisa@example.com', status: 'active' },
  { id: 'driver-8', name: 'Shane', imageUrl: 'https://picsum.photos/seed/driver8/100/100', phone: '555-0108', email: 'shane@example.com', status: 'inactive' },
];

// --- Data Import from CSV ---
// NOTE: The malformed 'Date Created' column has been manually removed from this data string to ensure correct parsing.
const csvData = `Prefix,First Name,Last Name,Company Name,Department,Job Title,Account Type,Primary Address,City,State,Zip,Account Number,VIP Number,Office Phone,Home Phone,Cellular Phone,Fax Number,Email Addresses,Referral Source,Account Priority,Account Status,Account Terms,Username,Private Notes,Preferences,Trip Notes,Notes for Drivers,Country,Alias
,Jamal,Ali,Back Ally,Owner,,(B)(BK),4630 Macleod Trl,Calgary,AB,,30007,,,,14033894979,,Jamal@backallycalgary.com,0,NP,Active,,Jamal@backallycalgary.com,,,,CA,
,jenna,Hassen,Cowboys night club,Managment,,(B)(BK),421 12 ave se,Calgary,AB,t2g1a5,30002,,,,15875825366,,kyle@cowboysnightclub.com;jenna@cowboysnightclub.com,0,VIP,Active,DUR,jenna@cowboysnightclub.com,drop at poker doors,drop at poker doors,,CA,
,Sanjana,Prasad,Redbull Canada,Marketing,field Marketing,(B)(P)(BK),1610 104 ave ne,calgary,AB,t3j 0r2,30003,,,,13067173377,,Sanjana.prasad@redbull.com,0,VIP,Active,DUR,Sanjana.prasad@redbull.com,,,,,CA,
Mr.,Mike,Shupenia,Side Street,Owner,,(B)(P)(BK),1167 kensington crescent nw,Calgary,AB,,30004,,14032703880,,14038527572,,Shupenia.sarah@gmail.com,0,NP,Active,,,,This is the owner of The Business,CA,
Mr.,kyle,Tainash,Cowboys night club,Managment,GM,(B)(BK),421 12 ave,Calgary,AB,t2g1a5,30000,,,,14038634848,,kyle@cowboysnightclub.com,0,VIP,Active,DUR,kyle@cowboysnightclub.com,,Drop at Poker doors,,Drop at Poker doors,CA,
,Mike,Ventura,Kildares,Managment,GM,(B)(BK),19369 Sheriff King St SW ##1202,Calgary,AB,T2X 0S4,30005,,14037190256,,14034708281,,kildaresgm@gmail.com,0,NP,Active,,,,,CA,
,kevin,Warner,The Unicorn,Managment,,(B)(P)(BK),223 8 Ave SW,Calgary,AB,,30008,,14032653665,,14039912826,,kevin@superpub.ca,0,NP,Active,,kevin@superpub.ca,,,,CA,
,Braedin,Weinberger,COMMONWELTH,,,(B)(BK),731 10 Ave SW,Calgary,AB,,30006,,,,14034627985,,Braedin@commonwelthbar.ca;info@commonwelthbar.ca,0,NP,Active,,Braedin@commonwelthbar.ca,,,,CA,`;

// Helper function to process the CSV and generate structured data
function processCsvData() {
    const lines = csvData.trim().split('\n');
    // Handle BOM character at the start of the file
    const headers = lines[0].replace(/^\uFEFF/, '').split(',').map(h => h.trim());
    const rows = lines.slice(1).map(line => {
        const values = line.split(',');
        const rowData: { [key: string]: string } = {};
        headers.forEach((header, index) => {
            rowData[header] = values[index]?.trim();
        });
        return rowData;
    });

    const corporateClientsMap = new Map<string, Omit<CorporateClient, 'id'>>();
    const contacts: Omit<Contact, 'id'>[] = [];

    rows.forEach((row, index) => {
        const companyName = row['Company Name'];
        const firstName = row['First Name'];
        const lastName = row['Last Name'];
        const fullName = toTitleCase(`${firstName} ${lastName}`);
        const email = row['Email Addresses']?.split(';')[0]; // Take the first email
        const phone = row['Cellular Phone'] || row['Office Phone'];

        if (!companyName || !email) return; // Skip rows without essential info

        let clientSlug = companyName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

        if (!corporateClientsMap.has(clientSlug)) {
             const address = `${row['Primary Address']}, ${row['City']}, ${row['State']}`;
             const clientData: Omit<CorporateClient, 'id'> = {
                name: toTitleCase(companyName),
                slug: clientSlug,
                defaultPickupLocation: toTitleCase(address),
                defaultDropoffLocation: toTitleCase(address),
                notes: row['Notes for Drivers'] || '',
                status: 'active',
             };
             if (companyName === 'Cowboys night club') {
                clientData.logoUrl = 'https://storage.googleapis.com/mm-react-app-videos-photos/cowboys-logo.png';
             }
             corporateClientsMap.set(clientSlug, clientData);
        }
        
        contacts.push({
            name: fullName,
            email: email,
            phone: phone,
            companyName: toTitleCase(companyName),
            corporateClientId: clientSlug, // Temporary slug, will be replaced with real ID
            source: row['Referral Source'] !== '0' ? row['Referral Source'] : 'Direct',
            notes: row['Private Notes'] || '',
        });
    });

    const finalCorporateClients: CorporateClient[] = [];
    const finalContacts: Contact[] = [];

    // Assign stable IDs
    let clientIndex = 1;
    for (const [slug, clientData] of corporateClientsMap.entries()) {
        const clientId = `client-${clientIndex}`;
        finalCorporateClients.push({ id: clientId, ...clientData });
        
        // Update contacts with the real ID
        contacts.forEach(contact => {
            if (contact.corporateClientId === slug) {
                contact.corporateClientId = clientId;
            }
        });
        clientIndex++;
    }

    contacts.forEach((contact, i) => {
        finalContacts.push({ id: `contact-${i + 1}`, ...contact });
    });

    return { corporateClients: finalCorporateClients, contacts: finalContacts };
}

const { corporateClients: importedClients, contacts: importedContacts } = processCsvData();

export const INITIAL_CORPORATE_CLIENTS: CorporateClient[] = importedClients;
export const INITIAL_CONTACTS: Contact[] = importedContacts;
export const INITIAL_BOOKINGS: Booking[] = []; // Start with a clean slate for bookings