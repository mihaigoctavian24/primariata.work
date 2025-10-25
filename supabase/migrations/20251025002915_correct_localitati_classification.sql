-- Correct locality classification based on Legea 351/2001
-- Fix municipalities that were incorrectly classified based on population

UPDATE localitati
SET tip = 'Municipiu'
WHERE nume IN (
  'Alba Iulia', 'Aiud', 'Blaj', 'Sebeș',
  'Arad',
  'Pitești', 'Câmpulung', 'Curtea de Argeș',
  'Bacău', 'Oradea', 'Bistrița', 'Botoșani',
  'Brașov', 'Codlea', 'Făgăraș', 'Săcele',
  'Brăila',
  'Buzău', 'Râmnicu Sărat',
  'Reșița', 'Caransebeș',
  'Cluj-Napoca', 'Câmpia Turzii', 'Dej', 'Gherla', 'Turda',
  'Constanța', 'Mangalia', 'Medgidia',
  'Sfântu Gheorghe',
  'Târgoviște', 'Moreni',
  'Craiova', 'Băilești', 'Calafat',
  'Galați', 'Tecuci',
  'Giurgiu',
  'Târgu Jiu', 'Motru',
  'Miercurea Ciuc', 'Odorheiu Secuiesc',
  'Deva', 'Brad', 'Hunedoara', 'Orăștie', 'Petroșani', 'Vulcan',
  'Slobozia',
  'Iași', 'Pașcani',
  'Baia Mare', 'Sighetu Marmației',
  'Drobeta-Turnu Severin', 'Orșova',
  'Târgu Mureș', 'Reghin', 'Sighișoara',
  'Piatra Neamț', 'Roman',
  'Slatina', 'Caracal',
  'Ploiești', 'Câmpina',
  'Satu Mare', 'Carei',
  'Zalău',
  'Sibiu', 'Mediaș',
  'Suceava', 'Fălticeni', 'Rădăuți', 'Vatra Dornei', 'Câmpulung Moldovenesc',
  'Alexandria', 'Roșiorii de Vede', 'Turnu Măgurele',
  'Timișoara', 'Lugoj',
  'Tulcea',
  'Vaslui', 'Bârlad', 'Huși',
  'Râmnicu Vâlcea', 'Drăgășani',
  'Focșani', 'Adjud'
);

-- Reclassify remaining localities based on population
UPDATE localitati
SET tip = CASE 
  WHEN tip = 'Sector' THEN 'Sector'
  WHEN tip = 'Municipiu' THEN 'Municipiu'
  WHEN populatie > 5000 THEN 'Oraș'
  ELSE 'Comună'
END
WHERE tip IS NOT NULL;
