const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { Op } = require('sequelize');

// Search endpoint
router.post('/search', async (req, res) => {
  try {
    const {
      itemName,
      description,
      governorate,
      city,
      address,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.body;

    // Build search conditions
    const whereClause = {};
    
    if (itemName) {
      whereClause.title = {
        [Op.iLike]: `%${itemName}%`
      };
    }

    if (description) {
      whereClause.description = {
        [Op.iLike]: `%${description}%`
      };
    }

    if (governorate) {
      whereClause.governorate = {
        [Op.iLike]: `%${governorate}%`
      };
    }

    if (city) {
      whereClause.city = {
        [Op.iLike]: `%${city}%`
      };
    }

    if (address) {
      whereClause.address = {
        [Op.iLike]: `%${address}%`
      };
    }

    // Calculate pagination
    const offset = (page - 1) * limit;

    // Perform search query
    const { count, rows } = await db.Item.findAndCountAll({
      where: whereClause,
      order: [[sortBy, sortOrder]],
      limit,
      offset,
      include: [
        {
          model: db.User,
          attributes: ['id', 'username', 'email']
        }
      ]
    });

    // Return results
    res.json({
      success: true,
      data: {
        items: rows,
        pagination: {
          total: count,
          page,
          limit,
          totalPages: Math.ceil(count / limit)
        }
      }
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Error performing search',
      error: error.message
    });
  }
});

// Get search suggestions
router.get('/suggestions', async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.json({
        success: true,
        data: []
      });
    }

    // Get suggestions from items table
    const suggestions = await db.Item.findAll({
      attributes: ['title'],
      where: {
        title: {
          [Op.iLike]: `%${query}%`
        }
      },
      limit: 5,
      group: ['title']
    });

    res.json({
      success: true,
      data: suggestions.map(s => s.title)
    });

  } catch (error) {
    console.error('Suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting suggestions',
      error: error.message
    });
  }
});

// Get locations (governorates and cities)
router.get('/locations', async (req, res) => {
  try {
    // Get unique governorates
    const governorates = await db.Item.findAll({
      attributes: ['governorate'],
      group: ['governorate'],
      where: {
        governorate: {
          [Op.not]: null
        }
      }
    });

    // Get unique cities for each governorate
    const cities = await db.Item.findAll({
      attributes: ['governorate', 'city'],
      group: ['governorate', 'city'],
      where: {
        city: {
          [Op.not]: null
        }
      }
    });

    // Format the response
    const locationData = governorates.map(gov => ({
      governorate: gov.governorate,
      cities: cities
        .filter(city => city.governorate === gov.governorate)
        .map(city => city.city)
    }));

    res.json({
      success: true,
      data: locationData
    });

  } catch (error) {
    console.error('Locations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting locations',
      error: error.message
    });
  }
});

module.exports = router; 