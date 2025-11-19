import { Injectable } from '@nestjs/common';
import { TipoNotificacion } from '../entidades/notificacion.entity';

@Injectable()
export class PlantillasService {
  
  /**
   * Prepara la plantilla de email según el tipo de notificación
   */
  async prepararPlantilla(tipo: TipoNotificacion, datos: any): Promise<{ asunto: string; contenido: string }> {
    switch (tipo) {
      case TipoNotificacion.CONFIRMACION_COMPRA:
        return this.plantillaConfirmacionCompra(datos);
      
      case TipoNotificacion.CAMBIO_ESTADO_ORDEN:
        return this.plantillaCambioEstadoOrden(datos);
      
      case TipoNotificacion.STOCK_BAJO:
        return this.plantillaStockBajo(datos);
      
      case TipoNotificacion.BIENVENIDA:
        return this.plantillaBienvenida(datos);
      
      case TipoNotificacion.CODIGO_VERIFICACION:
        return this.plantillaCodigoVerificacion(datos);
      
      default:
        return this.plantillaGenerica(tipo, datos);
    }
  }

  /**
   * Plantilla: Confirmación de Compra
   */
  private plantillaConfirmacionCompra(datos: any): { asunto: string; contenido: string } {
    const { numeroOrden, total, items, direccion } = datos;
    
    const itemsHTML = items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.producto.nombre}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.cantidad}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">$${item.precioUnitario}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">$${item.subtotal}</td>
      </tr>
    `).join('');

    const contenido = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
    .content { background: #f9f9f9; padding: 20px; }
    .order-info { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
    table { width: 100%; border-collapse: collapse; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Confirmación de Pedido</h1>
      <p>¡Gracias por tu compra!</p>
    </div>
    
    <div class="content">
      <div class="order-info">
        <h3>Detalles del Pedido</h3>
        <p><strong>Número de Orden:</strong> ${numeroOrden}</p>
        <p><strong>Total:</strong> $${total}</p>
        <p><strong>Dirección de Envío:</strong> ${direccion}</p>
      </div>

      <h3>Productos:</h3>
      <table>
        <thead>
          <tr>
            <th style="text-align: left; padding: 10px; background: #f5f5f5;">Producto</th>
            <th style="text-align: left; padding: 10px; background: #f5f5f5;">Cantidad</th>
            <th style="text-align: left; padding: 10px; background: #f5f5f5;">Precio Unitario</th>
            <th style="text-align: left; padding: 10px; background: #f5f5f5;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHTML}
        </tbody>
      </table>

      <p style="margin-top: 20px;">
        <strong>Estado:</strong> <span style="color: #4F46E5;">Pendiente</span>
      </p>
      
      <p>Te notificaremos cuando tu pedido sea enviado.</p>
    </div>
    
    <div class="footer">
      <p>© 2024 Tu Ecommerce. Todos los derechos reservados.</p>
    </div>
  </div>
</body>
</html>
    `;

    return {
      asunto: `✅ Confirmación de Pedido #${numeroOrden}`,
      contenido
    };
  }

  /**
   * Plantilla: Cambio de Estado de Orden
   */
  private plantillaCambioEstadoOrden(datos: any): { asunto: string; contenido: string } {
    const { numeroOrden, estadoAnterior, estadoNuevo, fechaEstimada } = datos;
    
    const estados = {
      'confirmada': '✅ Confirmada',
      'enviada': '🚚 Enviada', 
      'entregada': '🎉 Entregada',
      'cancelada': '❌ Cancelada'
    };

    const contenido = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #10B981; color: white; padding: 20px; text-align: center; }
    .content { background: #f9f9f9; padding: 20px; }
    .status-update { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; text-align: center; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔄 Actualización de Pedido</h1>
      <p>Tu pedido ha cambiado de estado</p>
    </div>
    
    <div class="content">
      <div class="status-update">
        <h2>${estados[estadoNuevo] || estadoNuevo}</h2>
        <p><strong>Orden:</strong> ${numeroOrden}</p>
        <p><strong>Estado anterior:</strong> ${estados[estadoAnterior] || estadoAnterior}</p>
        ${fechaEstimada ? `<p><strong>Fecha estimada de entrega:</strong> ${fechaEstimada}</p>` : ''}
      </div>
      
      <p>Puedes ver el detalle completo de tu pedido en tu cuenta.</p>
    </div>
    
    <div class="footer">
      <p>© 2024 Tu Ecommerce. Todos los derechos reservados.</p>
    </div>
  </div>
</body>
</html>
    `;

    return {
      asunto: `🔄 Actualización de Pedido #${numeroOrden}`,
      contenido
    };
  }

  /**
   * Plantilla: Stock Bajo
   */
  private plantillaStockBajo(datos: any): { asunto: string; contenido: string } {
    const { nombre, stock, stockMinimo } = datos;
    
    const contenido = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #F59E0B; color: white; padding: 20px; text-align: center; }
    .content { background: #f9f9f9; padding: 20px; }
    .alert { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #F59E0B; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚠️ Alerta de Stock Bajo</h1>
      <p>Producto necesita reabastecimiento</p>
    </div>
    
    <div class="content">
      <div class="alert">
        <h3>${nombre}</h3>
        <p><strong>Stock actual:</strong> ${stock} unidades</p>
        <p><strong>Stock mínimo:</strong> ${stockMinimo || 10} unidades</p>
        <p style="color: #DC2626; font-weight: bold;">¡Es necesario reabastecer el inventario!</p>
      </div>
      
      <p>Por favor, actualiza el stock de este producto en el panel de administración.</p>
    </div>
    
    <div class="footer">
      <p>© 2024 Tu Ecommerce. Sistema de Alertas</p>
    </div>
  </div>
</body>
</html>
    `;

    return {
      asunto: `⚠️ Alerta: Stock bajo de ${nombre}`,
      contenido
    };
  }

  /**
   * Plantilla: Bienvenida
   */
  private plantillaBienvenida(datos: any): { asunto: string; contenido: string } {
    const { nombre } = datos;
    
    const contenido = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #8B5CF6; color: white; padding: 20px; text-align: center; }
    .content { background: #f9f9f9; padding: 20px; }
    .welcome { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; text-align: center; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 ¡Bienvenido a Nuestra Tienda!</h1>
    </div>
    
    <div class="content">
      <div class="welcome">
        <h2>Hola ${nombre},</h2>
        <p>Estamos emocionados de tenerte como parte de nuestra comunidad.</p>
        <p>Ahora puedes:</p>
        <ul style="text-align: left; display: inline-block;">
          <li>Explorar nuestros productos</li>
          <li>Realizar compras seguras</li>
          <li>Seguir tus pedidos en tiempo real</li>
          <li>Recibir ofertas exclusivas</li>
        </ul>
      </div>
      
      <p>¡Empieza a explorar ahora!</p>
    </div>
    
    <div class="footer">
      <p>© 2024 Tu Ecommerce. Todos los derechos reservados.</p>
    </div>
  </div>
</body>
</html>
    `;

    return {
      asunto: `🎉 ¡Bienvenido a Nuestra Tienda!`,
      contenido
    };
  }

  /**
   * Plantilla: Código de Verificación (2FA)
   */
  private plantillaCodigoVerificacion(datos: any): { asunto: string; contenido: string } {
    const { codigo } = datos;
    
    const contenido = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #EF4444; color: white; padding: 20px; text-align: center; }
    .content { background: #f9f9f9; padding: 20px; }
    .code { background: white; padding: 20px; margin: 20px 0; border-radius: 5px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #EF4444; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔐 Código de Verificación</h1>
      <p>Usa este código para completar tu verificación</p>
    </div>
    
    <div class="content">
      <p>Tu código de verificación es:</p>
      <div class="code">${codigo}</div>
      <p>Este código expirará en 10 minutos.</p>
      <p><strong>No compartas este código con nadie.</strong></p>
    </div>
    
    <div class="footer">
      <p>© 2024 Tu Ecommerce. Todos los derechos reservados.</p>
    </div>
  </div>
</body>
</html>
    `;

    return {
      asunto: `🔐 Código de Verificación: ${codigo}`,
      contenido
    };
  }

  /**
   * Plantilla Genérica (fallback)
   */
  private plantillaGenerica(tipo: TipoNotificacion, datos: any): { asunto: string; contenido: string } {
    const contenido = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #6B7280; color: white; padding: 20px; text-align: center; }
    .content { background: #f9f9f9; padding: 20px; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Notificación</h1>
    </div>
    
    <div class="content">
      <p>${datos.mensaje || 'Tienes una nueva notificación.'}</p>
      <pre style="background: white; padding: 10px; border-radius: 5px; overflow-x: auto;">${JSON.stringify(datos, null, 2)}</pre>
    </div>
    
    <div class="footer">
      <p>© 2024 Tu Ecommerce. Todos los derechos reservados.</p>
    </div>
  </div>
</body>
</html>
    `;

    return {
      asunto: `Notificación: ${tipo}`,
      contenido
    };
  }
}