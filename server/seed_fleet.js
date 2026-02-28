/**
 * TruFleet — Fleet Vehicles Seed Script
 * Usage: node server/seed_fleet.js
 * Inserts 30 sample commercial vehicles into fleet_vehicles table.
 * Skips any that already exist (based on vehicle_number uniqueness).
 */

'use strict';

require('dotenv').config();
const supabase = require('./supabase');

const TABLE = 'fleet_vehicles';

const VEHICLES = [
  { vehicle_number: 'MH12AB1234', vin: '1HGBH41JXMN109186', engine_number: 'ENG001HONDA',   owner_name: 'Rajesh Mehta',        contact: '+91 9821001001', vehicle_type: 'Truck',    vehicle_usage: 'commercial', make: 'Tata',          model: 'Prima 4028.S', year: 2021, color: 'White',  fuel_type: 'Diesel',  engine_cc: '5700cc', status: 'active',   notes: 'Long haul logistics' },
  { vehicle_number: 'DL1CAB5678', vin: '2T1BURHE0JC004365', engine_number: 'ENG002TOYOTA',   owner_name: 'Priya Logistics Pvt', contact: '+91 9811002002', vehicle_type: 'Van',      vehicle_usage: 'commercial', make: 'Tata',          model: 'Ace Gold',     year: 2022, color: 'Silver', fuel_type: 'CNG',     engine_cc: '702cc',  status: 'active',   notes: 'City delivery' },
  { vehicle_number: 'KA03MK9012', vin: '3VWFE21C04M000001', engine_number: 'ENG003ASHOK',    owner_name: 'Suresh Transport Co', contact: '+91 9845003003', vehicle_type: 'Truck',    vehicle_usage: 'commercial', make: 'Ashok Leyland', model: 'Dost+',        year: 2020, color: 'Blue',   fuel_type: 'Diesel',  engine_cc: '3300cc', status: 'active',   notes: 'Furniture transport' },
  { vehicle_number: 'TN22BZ3456', vin: '4T1BF1FK5CU123456', engine_number: 'ENG004LEYLAND',  owner_name: 'Chennai Cargo Net',   contact: '+91 9894004004', vehicle_type: 'Tanker',   vehicle_usage: 'commercial', make: 'Ashok Leyland', model: 'Captain 3518', year: 2019, color: 'Red',    fuel_type: 'Diesel',  engine_cc: '5660cc', status: 'active',   notes: 'Chemical tanker' },
  { vehicle_number: 'GJ05BQ7890', vin: '5YJSA1CN5DFP01234', engine_number: 'ENG005MAHINDRA', owner_name: 'Patel Roadways',      contact: '+91 9898005005', vehicle_type: 'Pickup',   vehicle_usage: 'commercial', make: 'Mahindra',      model: 'Bolero Pickup',year: 2023, color: 'White',  fuel_type: 'Diesel',  engine_cc: '2523cc', status: 'active',   notes: 'Agricultural goods' },
  { vehicle_number: 'RJ14GB2345', vin: '1G1ZB5ST5GF123789', engine_number: 'ENG006FORCE',    owner_name: 'Desert Trans Ltd',    contact: '+91 9826006006', vehicle_type: 'Bus',      vehicle_usage: 'commercial', make: 'Force',         model: 'Traveller 26', year: 2021, color: 'Yellow', fuel_type: 'Diesel',  engine_cc: '2596cc', status: 'active',   notes: 'Staff transport' },
  { vehicle_number: 'UP32GX4567', vin: '3GTP1VEC4EG123456', engine_number: 'ENG007EICHER',   owner_name: 'UP Freight Carriers', contact: '+91 9811007007', vehicle_type: 'Truck',    vehicle_usage: 'commercial', make: 'Eicher',        model: 'Pro 6031',     year: 2020, color: 'Orange', fuel_type: 'Diesel',  engine_cc: '7700cc', status: 'active',   notes: 'Cement & construction' },
  { vehicle_number: 'HR26DN6789', vin: '2HGES16585H123456', engine_number: 'ENG008MARUTI',   owner_name: 'Haryana Haulage Co',  contact: '+91 9812008008', vehicle_type: 'Van',      vehicle_usage: 'commercial', make: 'Maruti Suzuki', model: 'Super Carry',  year: 2022, color: 'White',  fuel_type: 'CNG',     engine_cc: '793cc',  status: 'active',   notes: 'Grocery distribution' },
  { vehicle_number: 'PB10EK8901', vin: '5NPE24AF9GH312456', engine_number: 'ENG009KAMAZ',    owner_name: 'Punjab Prime Movers', contact: '+91 9876009009', vehicle_type: 'Truck',    vehicle_usage: 'commercial', make: 'KAMAZ',         model: '65115',        year: 2018, color: 'Red',    fuel_type: 'Diesel',  engine_cc: '11760cc',status: 'active',   notes: 'Grain transport' },
  { vehicle_number: 'WB26AT1234', vin: '1FTFW1ET9EFA12345', engine_number: 'ENG010ISUZU',    owner_name: 'Kolkata Cold Chain',  contact: '+91 9831010010', vehicle_type: 'Van',      vehicle_usage: 'commercial', make: 'Isuzu',         model: 'D-Max v-cross', year: 2022, color: 'Silver', fuel_type: 'Diesel', engine_cc: '1898cc', status: 'active',   notes: 'Cold storage logistics' },
  { vehicle_number: 'MH01BT5432', vin: '1N4AL3AP7FC123456', engine_number: 'ENG011TATA',     owner_name: 'Mumbai Speedy Cargo', contact: '+91 9920011011', vehicle_type: 'Truck',    vehicle_usage: 'commercial', make: 'Tata',          model: 'Ultra 1518',   year: 2023, color: 'Blue',   fuel_type: 'Diesel',  engine_cc: '5700cc', status: 'active',   notes: 'Express freight' },
  { vehicle_number: 'AP07CJ6543', vin: '5FNRL5H65CB123456', engine_number: 'ENG012VOLVO',    owner_name: 'Vizag Volvo Lines',   contact: '+91 9866012012', vehicle_type: 'Trailer',  vehicle_usage: 'commercial', make: 'Volvo',         model: 'FH16',         year: 2020, color: 'White',  fuel_type: 'Diesel',  engine_cc: '16000cc',status: 'active',   notes: 'Container haulage' },
  { vehicle_number: 'TS09EA7654', vin: '4T1BF3EK8AU123456', engine_number: 'ENG013SCANIA',   owner_name: 'Hyd Container Corp',  contact: '+91 9849013013', vehicle_type: 'Trailer',  vehicle_usage: 'commercial', make: 'Scania',        model: 'R500',         year: 2021, color: 'Green',  fuel_type: 'Diesel',  engine_cc: '12700cc',status: 'active',   notes: 'Port logistics' },
  { vehicle_number: 'KL07BE8765', vin: '1GNKVJED9BJ123456', engine_number: 'ENG014FORCE2',   owner_name: 'Kerala Kargo Net',    contact: '+91 9847014014', vehicle_type: 'Van',      vehicle_usage: 'commercial', make: 'Force',         model: 'Gurkha Xtreme',year: 2022, color: 'Black',  fuel_type: 'Diesel',  engine_cc: '2596cc', status: 'active',   notes: 'Hill station routes' },
  { vehicle_number: 'OD02FK9876', vin: '3C6UR5DL1EG123456', engine_number: 'ENG015MAHINDRA2',owner_name: 'Odisha Ore Movers',   contact: '+91 9861015015', vehicle_type: 'Truck',    vehicle_usage: 'commercial', make: 'Mahindra',      model: 'Furio 14',     year: 2019, color: 'Red',    fuel_type: 'Diesel',  engine_cc: '3500cc', status: 'active',   notes: 'Mining sector' },
  { vehicle_number: 'CG04CD1111', vin: '1FMCU9GX8AKB12345', engine_number: 'ENG016EICHER2',  owner_name: 'Raipur Rapid Trans',  contact: '+91 9893016016', vehicle_type: 'Truck',    vehicle_usage: 'commercial', make: 'Eicher',        model: 'Pro 3017',     year: 2021, color: 'White',  fuel_type: 'Diesel',  engine_cc: '3300cc', status: 'active',   notes: 'FMCG delivery' },
  { vehicle_number: 'JK02DZ2222', vin: '2C3CDXJG8DH123456', engine_number: 'ENG017TATA2',    owner_name: 'Jammu Hill Carriers', contact: '+91 9419017017', vehicle_type: 'Truck',    vehicle_usage: 'commercial', make: 'Tata',          model: 'Signa 3118.T', year: 2020, color: 'Blue',   fuel_type: 'Diesel',  engine_cc: '5883cc', status: 'active',   notes: 'Mountain terrain routes' },
  { vehicle_number: 'AS01CK3333', vin: '5GAKRDED9CJ123456', engine_number: 'ENG018DAEWOO',   owner_name: 'Guwahati Goods Co',   contact: '+91 9435018018', vehicle_type: 'Bus',      vehicle_usage: 'commercial', make: 'SML Isuzu',     model: 'Sartaj GS 40', year: 2022, color: 'Yellow', fuel_type: 'Diesel',  engine_cc: '3455cc', status: 'active',   notes: 'Employee shuttle' },
  { vehicle_number: 'MZ01AB4444', vin: '4JGBF2FEXBA123456', engine_number: 'ENG019PIAGGIO',  owner_name: 'Aizawl Express Frt',  contact: '+91 9436019019', vehicle_type: 'Pickup',   vehicle_usage: 'commercial', make: 'Piaggio',       model: 'Ape Xtra LDX', year: 2023, color: 'Green',  fuel_type: 'CNG',     engine_cc: '436cc',  status: 'active',   notes: 'Last mile delivery' },
  { vehicle_number: 'NL01BC5555', vin: '3VWF17AT9FM123456', engine_number: 'ENG020TATA3',    owner_name: 'Kohima Cargo Pvt',    contact: '+91 9856020020', vehicle_type: 'Van',      vehicle_usage: 'commercial', make: 'Tata',          model: 'Winger',       year: 2021, color: 'Silver', fuel_type: 'Diesel',  engine_cc: '2956cc', status: 'active',   notes: 'Ambulance support vehicle' },
  { vehicle_number: 'MH04FG6666', vin: '1HGCP2F31BA123456', engine_number: 'ENG021HONDA2',   owner_name: 'Pune Parts Express',  contact: '+91 9922021021', vehicle_type: 'Van',      vehicle_usage: 'commercial', make: 'Maruti Suzuki', model: 'Eeco Cargo',   year: 2023, color: 'White',  fuel_type: 'CNG',     engine_cc: '1196cc', status: 'active',   notes: 'Auto parts courier' },
  { vehicle_number: 'GJ01BH7777', vin: '1G1YY22G6W5123456', engine_number: 'ENG022ASHOK2',   owner_name: 'Ahmedabad AHL Moves', contact: '+91 9824022022', vehicle_type: 'Tanker',   vehicle_usage: 'commercial', make: 'Ashok Leyland', model: 'MiTR 1615',    year: 2020, color: 'White',  fuel_type: 'Diesel',  engine_cc: '3300cc', status: 'active',   notes: 'Milk tanker' },
  { vehicle_number: 'DL09AX8888', vin: '3CZRE48509G123456', engine_number: 'ENG023MAHINDRA3',owner_name: 'Delhi NCR Couriers',  contact: '+91 9810023023', vehicle_type: 'Pickup',   vehicle_usage: 'commercial', make: 'Mahindra',      model: 'Jeeto Plus',   year: 2022, color: 'Blue',   fuel_type: 'CNG',     engine_cc: '909cc',  status: 'active',   notes: 'E-commerce last mile' },
  { vehicle_number: 'HR55AZ9999', vin: '2T3DFREV1JW123456', engine_number: 'ENG024BEML',     owner_name: 'Gurugram Swift Logi', contact: '+91 9818024024', vehicle_type: 'Truck',    vehicle_usage: 'commercial', make: 'BharatBenz',    model: '1617R',        year: 2021, color: 'Grey',   fuel_type: 'Diesel',  engine_cc: '6400cc', status: 'active',   notes: 'Pharma logistics' },
  { vehicle_number: 'UP78BZ1010', vin: '1N4AA5AP7EC123456', engine_number: 'ENG025LEYLAND2', owner_name: 'Varanasi Agri Trans', contact: '+91 9839025025', vehicle_type: 'Truck',    vehicle_usage: 'commercial', make: 'Ashok Leyland', model: 'Dost Strong',  year: 2022, color: 'Red',    fuel_type: 'Diesel',  engine_cc: '3300cc', status: 'active',   notes: 'Agro produce transport' },
  { vehicle_number: 'TN37CE2020', vin: '5NPDH4AE9GH123456', engine_number: 'ENG026TATA4',    owner_name: 'Coimbatore T-Movers', contact: '+91 9942026026', vehicle_type: 'Truck',    vehicle_usage: 'commercial', make: 'Tata',          model: 'LPT 1918',     year: 2019, color: 'White',  fuel_type: 'Diesel',  engine_cc: '5883cc', status: 'inactive', notes: 'Under maintenance' },
  { vehicle_number: 'KA20MR3030', vin: '3N1AB7AP0EY123456', engine_number: 'ENG027ISUZU2',   owner_name: 'Mysore Milk Board',   contact: '+91 9880027027', vehicle_type: 'Tanker',   vehicle_usage: 'commercial', make: 'Isuzu',         model: 'NQR 90',       year: 2020, color: 'White',  fuel_type: 'Diesel',  engine_cc: '4570cc', status: 'active',   notes: 'Dairy tanker route' },
  { vehicle_number: 'MH14GH4040', vin: '1FMHK7B80BGA12345', engine_number: 'ENG028VOLVO2',   owner_name: 'Nashik Wine Carriers',contact: '+91 9923028028', vehicle_type: 'Van',      vehicle_usage: 'commercial', make: 'Volvo',         model: 'B9R',          year: 2021, color: 'Silver', fuel_type: 'Diesel',  engine_cc: '9400cc', status: 'active',   notes: 'Temperature controlled' },
  { vehicle_number: 'PB65GF5050', vin: '5GZCZ43D13S123456', engine_number: 'ENG029SCANIA2',  owner_name: 'Amritsar Bulk Frt',   contact: '+91 9888029029', vehicle_type: 'Trailer',  vehicle_usage: 'commercial', make: 'Scania',        model: 'P360',         year: 2018, color: 'Orange', fuel_type: 'Diesel',  engine_cc: '9300cc', status: 'suspended',notes: 'Insurance renewal pending' },
  { vehicle_number: 'WB06CD6060', vin: '4T1BF3EK2AU123456', engine_number: 'ENG030DAIMLER',  owner_name: 'Howrah Heavy Movers', contact: '+91 9830030030', vehicle_type: 'Truck',    vehicle_usage: 'commercial', make: 'BharatBenz',    model: '4228R',        year: 2022, color: 'White',  fuel_type: 'Diesel',  engine_cc: '7700cc', status: 'active',   notes: 'Steel plant logistics' },
];

async function seed() {
  console.log(`\n🌱  Seeding ${VEHICLES.length} vehicles into "${TABLE}"…\n`);

  let inserted = 0;
  let skipped  = 0;
  let failed   = 0;

  for (const v of VEHICLES) {
    const { data, error } = await supabase
      .from(TABLE)
      .insert([v])
      .select('vehicle_number')
      .single();

    if (error) {
      if (error.message.includes('unique') || error.message.includes('duplicate') || error.code === '23505') {
        console.log(`  ⏭  SKIP   ${v.vehicle_number} — already exists`);
        skipped++;
      } else {
        console.error(`  ✗  FAIL   ${v.vehicle_number} — ${error.message}`);
        failed++;
      }
    } else {
      console.log(`  ✓  INSERT ${data.vehicle_number}`);
      inserted++;
    }
  }

  console.log(`\n─────────────────────────────────────`);
  console.log(`  Inserted : ${inserted}`);
  console.log(`  Skipped  : ${skipped}`);
  console.log(`  Failed   : ${failed}`);
  console.log(`  Total    : ${VEHICLES.length}`);
  console.log(`─────────────────────────────────────\n`);

  process.exit(failed > 0 ? 1 : 0);
}

seed().catch(err => { console.error(err); process.exit(1); });
