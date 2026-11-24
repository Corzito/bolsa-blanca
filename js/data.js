/* Contenido de la app: sale del material "Reciclaje.docx" y de la infografía.
   Para cambiar textos o agregar residuos, edita este archivo. */

const BOLSAS = {
  blanca: {
    nombre: 'Bolsa blanca',
    tipo: 'Aprovechables',
    color: '#FFFFFF',
    tinta: '#1C1C1E',
    acento: '#0A84FF',
    resumen: 'Todo lo que sirve y está limpio. Es la protagonista para los recicladores.',
    regla: 'Todo limpio y seco',
    items: ['Botellas plásticas', 'Cartón', 'Papel', 'Latas', 'Frascos de vidrio', 'Cajas de Tetra Pak']
  },
  verde: {
    nombre: 'Bolsa verde',
    tipo: 'Orgánicos',
    color: '#30B350',
    tinta: '#FFFFFF',
    acento: '#30B350',
    resumen: 'Restos de comida y cáscaras.',
    regla: 'Solo orgánicos',
    items: ['Restos de comida', 'Cáscaras de frutas y verduras']
  },
  negra: {
    nombre: 'Bolsa negra',
    tipo: 'No aprovechables',
    color: '#1C1C1E',
    tinta: '#FFFFFF',
    acento: '#FF453A',
    resumen: 'Lo que definitivamente no se puede reciclar.',
    regla: 'No se recicla',
    items: ['Papel higiénico', 'Pañales', 'Servilletas sucias', 'Colillas', 'Empaques de mecato metalizados', 'Icopor untado', 'Cajas de pizza con grasa']
  },
  especial: {
    nombre: 'Residuo especial',
    tipo: 'Punto posconsumo',
    color: '#FF9F0A',
    tinta: '#FFFFFF',
    acento: '#FF9F0A',
    resumen: 'No va en ninguna de las tres bolsas. Llévalo a un punto posconsumo autorizado.',
    regla: 'Ninguna bolsa',
    items: ['Pilas', 'Baterías', 'Bombillos', 'Medicamentos vencidos', 'Aceite de cocina usado', 'Aparatos electrónicos dañados']
  }
};

/* Buscador "¿En qué bolsa va?" y el juego. b = bolsa, n = nota corta */
const RESIDUOS = [
  { t: 'Botella plástica', b: 'blanca', n: 'Enjuágala, aplástala y ponle la tapa.', k: 'gaseosa agua pet envase' },
  { t: 'Caja de cartón', b: 'blanca', n: 'Limpia, seca y desarmada.', k: 'carton caja domicilio' },
  { t: 'Hojas de papel', b: 'blanca', n: 'Papel de archivo seco y limpio.', k: 'papel hoja cuaderno fotocopia' },
  { t: 'Periódico y revistas', b: 'blanca', n: 'Secos y sin grasa.', k: 'periodico revista' },
  { t: 'Lata de gaseosa o cerveza', b: 'blanca', n: 'Vacía y escurrida.', k: 'lata aluminio cerveza' },
  { t: 'Frasco de vidrio', b: 'blanca', n: 'Limpio y seco.', k: 'vidrio frasco mermelada' },
  { t: 'Botella de vidrio', b: 'blanca', n: 'Limpia y seca.', k: 'vidrio botella vino cerveza' },
  { t: 'Caja de Tetra Pak', b: 'blanca', n: 'Enjuágala y aplástala.', k: 'tetrapak jugo leche caja' },
  { t: 'Bolsa de leche', b: 'blanca', n: 'Enjuágala y escúrrela: si va sucia moja el cartón.', k: 'leche bolsa' },
  { t: 'Envase de yogur', b: 'blanca', n: 'Enjuagado y seco.', k: 'yogurt kumis vaso' },
  { t: 'Lata de atún o sardina', b: 'blanca', n: 'Limpia y seca, sin residuos.', k: 'atun sardina lata conserva' },
  { t: 'Tapas plásticas', b: 'blanca', n: 'Sepáralas de las tapas de cerveza.', k: 'tapa tapita' },
  { t: 'Tapas de cerveza', b: 'blanca', n: 'Aparte de las tapas plásticas.', k: 'tapa metal corcholata' },
  { t: 'Bolsas plásticas limpias', b: 'blanca', n: 'Limpias y secas.', k: 'bolsa plastico' },
  { t: 'Envase de champú o jabón', b: 'blanca', n: 'Enjuagado y seco.', k: 'shampoo champu detergente envase' },
  { t: 'Cáscaras de fruta', b: 'verde', n: 'Orgánico.', k: 'cascara banano naranja fruta' },
  { t: 'Restos de comida', b: 'verde', n: 'Orgánico.', k: 'comida sobras arroz' },
  { t: 'Cáscaras de huevo', b: 'verde', n: 'Orgánico.', k: 'huevo' },
  { t: 'Borra de café', b: 'verde', n: 'Orgánico.', k: 'cafe tinto' },
  { t: 'Verduras dañadas', b: 'verde', n: 'Orgánico.', k: 'verdura papa tomate' },
  { t: 'Papel higiénico', b: 'negra', n: 'Es desecho sanitario.', k: 'higienico baño' },
  { t: 'Pañales', b: 'negra', n: 'Es desecho sanitario.', k: 'pañal' },
  { t: 'Servilletas sucias', b: 'negra', n: 'Ya no se pueden transformar.', k: 'servilleta' },
  { t: 'Colillas de cigarrillo', b: 'negra', n: 'No se reciclan.', k: 'colilla cigarro' },
  { t: 'Paquete de mecato metalizado', b: 'negra', n: 'Papas, chitos y similares: no se reciclan.', k: 'mecato paquete papas chitos snack' },
  { t: 'Icopor con comida', b: 'negra', n: 'Untado ya no sirve.', k: 'icopor plato comida' },
  { t: 'Caja de pizza con grasa', b: 'negra', n: 'La grasa daña el cartón.', k: 'pizza caja' },
  { t: 'Toallas higiénicas', b: 'negra', n: 'Es desecho sanitario.', k: 'toalla higienica' },
  { t: 'Pilas', b: 'especial', n: 'Llévalas a un punto posconsumo.', k: 'pila' },
  { t: 'Batería de celular', b: 'especial', n: 'Llévala a un punto posconsumo.', k: 'bateria celular' },
  { t: 'Bombillo', b: 'especial', n: 'Llévalo a un punto posconsumo.', k: 'bombillo foco lampara' },
  { t: 'Medicamentos vencidos', b: 'especial', n: 'Llévalos a un punto posconsumo.', k: 'medicamento pastilla droga' },
  { t: 'Aceite de cocina usado', b: 'especial', n: 'Nunca por el lavaplatos.', k: 'aceite' },
  { t: 'Celular o aparato dañado', b: 'especial', n: 'Llévalo a un punto posconsumo.', k: 'celular electronico cargador computador' },
  { t: 'Vidrio roto', b: 'blanca', n: 'Envuélvelo en periódico o dentro de una botella cortada y marca "VIDRIO ROTO".', k: 'vidrio roto vaso' }
];

const REGLAS = [
  {
    titulo: 'Enjuagar y escurrir',
    corto: 'Envases limpios, sin residuos y secos.',
    texto: 'Si echamos una bolsa de leche o un envase de yogur con residuos adentro, cuando la bolsa se aplaste va a mojar todo el papel y el cartón. El cartón mojado o sucio ya no se lo compran al reciclador. Un enjuague rápido con un poquito de agua y dejar escurrir basta.'
  },
  {
    titulo: 'Aplastar y desarmar',
    corto: 'Aplasta la botella y ponle la tapa.',
    texto: 'Una botella inflada ocupa aire; aplastada y con tapa ocupa la tercera parte. Lo mismo con las cajas de cartón: desármenlas. Así el reciclador puede cargar mucho más material en su carreta o vehículo en un solo viaje.'
  },
  {
    titulo: 'Cero trampas cortopunzantes',
    corto: 'Nunca vidrio roto, cuchillas o agujas sueltas.',
    texto: 'Si se rompe un vaso, envuélvanlo en periódico o métanlo dentro de una botella plástica cortada y marcada por fuera con marcador: "VIDRIO ROTO". Es la diferencia entre que un reciclador trabaje tranquilo o termine en urgencias.'
  },
  {
    titulo: 'Sacar a tiempo y por separado',
    corto: 'De 30 a 60 minutos antes de que pase el camión.',
    texto: 'Saquen la bolsa blanca unos 30 a 60 minutos antes de que pase el camión de la basura (o en el horario en que pasa la ruta de reciclaje del sector) y déjenla a un lado, separada de la bolsa negra. Así no tienen que esculcar entre desechos sanitarios para encontrarla.'
  }
];

const TIPS = [
  'Botellas, envases y bolsas limpias y secas.',
  'Cartón limpio y seco; desarma las cajas.',
  'Papel de archivo seco y limpio.',
  'Botellas y frascos de vidrio limpios y secos. Si es vidrio en pedazos, envuélvelo muy bien y rotúlalo "VIDRIOS ROTOS".',
  'Tapas plásticas separadas de las tapas de cerveza.',
  'Empaques de atún o sardina limpios y secos, sin residuos.'
];

/* Columnas de la hoja de SEGUIMIENTO del documento */
const CHEQUEOS = [
  { id: 'blanca', label: '¿Saca bolsa blanca o marcada?' },
  { id: 'limpio', label: '¿Material limpio y seco?', sub: 'Sin líquidos ni grasas' },
  { id: 'aplastado', label: '¿Aplastado o desarmado?', sub: 'Botellas plásticas, cartón' },
  { id: 'seguro', label: '¿Sin cortopunzantes sueltos?' }
];

/* Marca de la empresa: pon el logo en assets/logo.png (PNG con fondo transparente).
   Si el archivo no existe, la app usa el ícono de la bolsa. */
const MARCA = {
  logo: 'assets/logo.png',
  nombre: 'ProAmbientes'   // Sale en el borde de abajo del sticker
};

/* Retroalimentación cuando un chequeo falla */
const RETRO = {
  blanca: {
    titulo: 'Separar en bolsa blanca',
    texto: 'Saque el material aprovechable en bolsa blanca o marcada, siempre aparte de la bolsa negra.'
  },
  limpio: {
    titulo: 'Enjuagar y escurrir',
    texto: 'Enjuague rápido los envases (leche, yogur, latas) y déjelos escurrir. El cartón mojado o sucio ya no se lo compran al reciclador.'
  },
  aplastado: {
    titulo: 'Aplastar y desarmar',
    texto: 'Aplaste las botellas y póngales la tapa; desarme las cajas de cartón. Así el reciclador carga más material en un solo viaje.'
  },
  seguro: {
    titulo: 'Cero cortopunzantes sueltos',
    texto: 'Nunca meta vidrio roto, cuchillas o agujas sueltas. Envuélvalos en periódico o dentro de una botella cortada y marque "VIDRIO ROTO".'
  }
};

/* Insignias por vivienda. Se ganan con visitas seguidas que cumplen.
   "Cumple" suma 1 a la racha, "Cumple parcial" la mantiene y "No cumple" la reinicia. */
const NIVELES = [
  { id: 'semilla',  nombre: 'Semilla',   racha: 1,  color: '#8FD14F', oscuro: '#4E8A1E', lema: 'Empezó a reciclar bien' },
  { id: 'brote',    nombre: 'Brote',     racha: 3,  color: '#34C759', oscuro: '#1E7A36', lema: 'Recicla con constancia' },
  { id: 'arbol',    nombre: 'Árbol',     racha: 6,  color: '#1E9E45', oscuro: '#0F5C27', lema: 'Ejemplo para el barrio' },
  { id: 'guardian', nombre: 'Guardián',  racha: 10, color: '#F5B700', oscuro: '#8A6300', lema: 'Aliado del reciclador' }
];