const { Op, Sequelize } = require('sequelize');
const Order = require('../entities/Order');
const Product = require('../entities/Product');
const PDFDocument = require('pdfkit');

exports.getSalesMetrics = async (req, res) => {
  try {
    const totalOrders = await Order.count();
    const totalRevenue = await Order.sum('grandTotal');
    
    // Group sales by date for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const salesByDate = await Order.findAll({
      attributes: [
        [Sequelize.fn('date_trunc', 'day', Sequelize.col('createdAt')), 'date'],
        [Sequelize.fn('sum', Sequelize.col('grandTotal')), 'revenue']
      ],
      where: {
        createdAt: {
          [Op.gte]: thirtyDaysAgo
        }
      },
      group: [Sequelize.fn('date_trunc', 'day', Sequelize.col('createdAt'))],
      order: [[Sequelize.fn('date_trunc', 'day', Sequelize.col('createdAt')), 'ASC']]
    });

    res.json({
      totalOrders,
      totalRevenue: totalRevenue || 0,
      salesByDate
    });
  } catch (error) {
    console.error('Error fetching sales metrics:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getInventoryMetrics = async (req, res) => {
  try {
    const products = await Product.findAll();
    let lowStockItems = [];
    let outOfStockItems = [];
    
    const inventoryData = products.map(p => {
      const totalStock = (p.stockS || 0) + (p.stockM || 0) + (p.stockL || 0);
      if (totalStock === 0) outOfStockItems.push(p);
      else if (totalStock < 10) lowStockItems.push(p);
      return {
        ...p.toJSON(),
        totalStock
      };
    });

    res.json({
      totalProducts: products.length,
      outOfStockCount: outOfStockItems.length,
      lowStockCount: lowStockItems.length,
      inventory: inventoryData
    });
  } catch (error) {
    console.error('Error fetching inventory metrics:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getTopProducts = async (req, res) => {
  try {
    const orders = await Order.findAll({ attributes: ['items'] });
    const productSales = {};

    orders.forEach(order => {
      const items = order.items || [];
      items.forEach(item => {
        if (!productSales[item.id]) {
          productSales[item.id] = { id: item.id, name: item.name, totalSold: 0, revenue: 0 };
        }
        productSales[item.id].totalSold += item.quantity;
        productSales[item.id].revenue += item.price * item.quantity;
      });
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, 5);

    res.json(topProducts);
  } catch (error) {
    console.error('Error fetching top products:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.generatePDFReport = async (req, res) => {
  try {
    const type = req.query.type || 'sales'; // 'sales' or 'inventory'
    
    const doc = new PDFDocument({ margins: { top: 50, bottom: 20, left: 50, right: 50 }, size: 'A4', bufferPages: true });
    const filename = `${type}_report_${Date.now()}.pdf`;

    res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"');
    res.setHeader('Content-type', 'application/pdf');

    doc.pipe(res);
    
    // Header
    doc.fillColor('#18181b').fontSize(24).font('Helvetica-Bold').text('LIYARA CLOTHING', { align: 'center' });
    doc.fillColor('#71717a').fontSize(10).font('Helvetica').text('123 Fashion Street, Colombo, Sri Lanka', { align: 'center' });
    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#e4e4e7').stroke();
    doc.moveDown(1);
    
    // Title
    doc.fillColor('#000000').fontSize(18).font('Helvetica-Bold').text(`${type === 'sales' ? 'SALES & REVENUE' : 'INVENTORY STATUS'} REPORT`, { align: 'center' });
    doc.fillColor('#a1a1aa').fontSize(10).font('Helvetica').text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown(2);

    if (type === 'sales') {
      const totalOrders = await Order.count();
      const totalRevenue = await Order.sum('grandTotal') || 0;
      
      // Summary Box
      let startY = doc.y;
      doc.rect(50, startY, 495, 80).fillAndStroke('#f8fafc', '#e2e8f0');
      doc.fillColor('#334155').fontSize(12).font('Helvetica-Bold').text('EXECUTIVE SUMMARY', 65, startY + 10);
      doc.fillColor('#0f172a').fontSize(11).font('Helvetica').text(`Total Orders Processed: ${totalOrders}`, 65, startY + 35);
      doc.fillColor('#0f172a').fontSize(11).font('Helvetica').text(`Total Revenue Generated: Rs. ${totalRevenue.toLocaleString()}`, 65, startY + 55);
      
      doc.y = startY + 100;
      doc.moveDown(2);
      
      doc.fontSize(14).font('Helvetica-Bold').text('Recent Orders', 50, doc.y);
      doc.moveDown(0.5);
      
      // Table Header
      const tableTop = doc.y;
      doc.font('Helvetica-Bold').fontSize(10).fillColor('#ffffff');
      doc.rect(50, tableTop, 495, 25).fill('#1e293b');
      doc.fillColor('#ffffff').text('Order ID', 60, tableTop + 8);
      doc.text('Date', 200, tableTop + 8);
      doc.text('Status', 320, tableTop + 8);
      doc.text('Total', 450, tableTop + 8);
      
      const orders = await Order.findAll({ limit: 15, order: [['createdAt', 'DESC']] });
      
      let y = tableTop + 25;
      doc.font('Helvetica').fontSize(9).fillColor('#334155');
      
      orders.forEach((order, i) => {
        if (y > 700) { doc.addPage(); y = 50; } // pagination
        
        if (i % 2 === 0) doc.rect(50, y, 495, 25).fill('#f8fafc');
        
        doc.fillColor('#334155');
        doc.text(order.id.substring(0, 8) + '...', 60, y + 8);
        doc.text(new Date(order.createdAt).toLocaleDateString(), 200, y + 8);
        doc.text(order.status, 320, y + 8);
        doc.text(`Rs. ${order.grandTotal.toLocaleString()}`, 450, y + 8);
        
        y += 25;
      });

    } else {
      let products = await Product.findAll();
      products = products.map(p => {
        const pObj = p.toJSON();
        pObj.totalStock = pObj.stockS + pObj.stockM + pObj.stockL;
        return pObj;
      }).sort((a, b) => a.totalStock - b.totalStock);
      
      const outOfStock = products.filter(p => p.totalStock === 0);
      const lowStock = products.filter(p => p.totalStock > 0 && p.totalStock < 10);
      
      // Summary Box
      let startY = doc.y;
      doc.rect(50, startY, 495, 90).fillAndStroke('#f8fafc', '#e2e8f0');
      doc.fillColor('#334155').fontSize(12).font('Helvetica-Bold').text('INVENTORY SUMMARY', 65, startY + 10);
      doc.fillColor('#0f172a').fontSize(10).font('Helvetica').text(`Total Unique Products: ${products.length}`, 65, startY + 35);
      doc.fillColor('#ef4444').font('Helvetica-Bold').text(`Out of Stock: ${outOfStock.length}`, 65, startY + 55);
      doc.fillColor('#eab308').text(`Low Stock (< 10): ${lowStock.length}`, 65, startY + 75);
      
      doc.y = startY + 110;
      doc.moveDown(2);
      
      doc.fillColor('#0f172a').fontSize(14).font('Helvetica-Bold').text('Detailed Inventory List', 50, doc.y);
      doc.moveDown(0.5);
      
      // Table Header
      const tableTop = doc.y;
      doc.font('Helvetica-Bold').fontSize(10).fillColor('#ffffff');
      doc.rect(50, tableTop, 495, 25).fill('#1e293b');
      doc.fillColor('#ffffff').text('Product Name', 60, tableTop + 8);
      doc.text('Cat', 270, tableTop + 8);
      doc.text('S', 310, tableTop + 8);
      doc.text('M', 350, tableTop + 8);
      doc.text('L', 390, tableTop + 8);
      doc.text('Total', 430, tableTop + 8);
      doc.text('Status', 480, tableTop + 8);
      
      let y = tableTop + 25;
      
      products.forEach((p, i) => {
        if (y > 700) { doc.addPage(); y = 50; }
        
        if (i % 2 === 0) doc.rect(50, y, 495, 25).fill('#f8fafc');
        
        doc.font('Helvetica').fontSize(9).fillColor('#334155');
        doc.text(p.name.substring(0, 40), 60, y + 8);
        doc.text(p.CategoryId || '-', 270, y + 8);
        doc.text(p.stockS.toString(), 310, y + 8);
        doc.text(p.stockM.toString(), 350, y + 8);
        doc.text(p.stockL.toString(), 390, y + 8);
        doc.text(p.totalStock.toString(), 430, y + 8);
        
        if (p.totalStock === 0) {
          doc.fillColor('#ef4444').font('Helvetica-Bold').text('OUT', 480, y + 8);
        } else if (p.totalStock < 10) {
          doc.fillColor('#eab308').font('Helvetica-Bold').text('LOW', 480, y + 8);
        } else {
          doc.fillColor('#22c55e').font('Helvetica-Bold').text('OK', 480, y + 8);
        }
        
        y += 25;
      });
    }
    
    // Footer
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);
      doc.moveTo(50, 780).lineTo(545, 780).strokeColor('#e4e4e7').stroke();
      doc.fillColor('#a1a1aa').fontSize(8).font('Helvetica').text(
        `Liyara Clothing - Confidential Internal Report - Page ${i + 1} of ${pages.count}`,
        50,
        790,
        { align: 'center' }
      );
    }
    
    doc.end();
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).send('Error generating PDF');
  }
};
