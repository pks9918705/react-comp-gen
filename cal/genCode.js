
const Code = require('../models/Code');


function generateReactComponentCode(json, componentType) {
    const title = json.title.split(' ').join('');
    let componentCode;

    switch (componentType.toLowerCase()) {
        case 'form':
            componentCode = generateReactComponentForm(json, title);
            break;
        case 'catalog':
            componentCode = generateReactComponentCatalog(json, title);
            break;
        case 'navbar':
            componentCode = generateNavbarComponent(json,title);
            break;
        case 'slider':
            componentCode = generateSliderComponentCode(json, title);
            break;
        case 'chart':
            componentCode = generateChartComponentCode(json, title);
            break;
        case 'starrating':
            componentCode = generateStarRatingComponent(json, title);
            break;
        default:
            throw new Error(`Unsupported componentType: ${componentType}`);
    }

    return componentCode;
}

function generateReactComponentForm(json, title) {
    const { fields, submitButtonLabel } = json;

    const generateFieldCode = (field) => `
        <div>
            <label htmlFor="${field.name}">
                ${field.label}:
            </label>
            <input
                type="${field.type}"
                id="${field.name}"
                name="${field.name}"
                placeholder="${field.placeholder || ''}"
                value={formData.${field.name}}
                onChange={handleInputChange}
                ${field.required ? 'required' : ''}
            />
        </div>
    `;

    const generateListingCode = fields.map(generateFieldCode).join('');
    const initialFormData = `{${fields.map(field => `${field.name}: ""`).join(',')}}`;

    return `
        import React, { useState } from 'react';

        const ${title} = () => {
            const [formData, setFormData] = useState(${initialFormData});

            const handleInputChange = (event) => {
                const { name, value } = event.target;
                setFormData({ ...formData, [name]: value });
            };

            const handleSubmit = (event) => {
                event.preventDefault();
                console.log('Form submitted with data:', formData);
            };

            return (
                <>
                    <form onSubmit={handleSubmit}>
                        <h2>${json.title}</h2>
                        ${generateListingCode}
                        <button type="submit">${submitButtonLabel}</button>
                    </form>
                </>
            );
        };

        export default ${title};
    `;
}

function generateReactComponentCatalog(jsonSchema, title) {
    const { categories } = jsonSchema;

    const generateProductCode = (product) => `
        <div key="${product.name}">
            <h3>${product.name}</h3>
            <p>Price: $${product.price.toFixed(2)}</p>
            <p>${product.description}</p>
        </div>
    `;

    const generateCategoryCode = (category) => `
        <div key="${category.name}">
            <h2>${category.name}</h2>
            ${category.products.map(generateProductCode).join('')}
        </div>
    `;

    return `
        import React from 'react';

        const ${title} = () => {
            return (
                <div>
                    <h1>${jsonSchema.title}</h1>
                    ${categories.map(generateCategoryCode).join('')}
                </div>
            );
        };

        export default ${title};
    `;
}

function generateSliderComponentCode(schema, title) {
    const {
        minValue = 0,
        maxValue = 1000,
        defaultValue = 500,
        step = 10,
        unit,
        showValue,
    } = schema;

    return `
        import React, { useState } from 'react';

        const ${title} = () => {
            const [value, setValue] = useState(${defaultValue});

            const handleInputChange = (event) => {
                const newValue = parseInt(event.target.value, 10);
                if (newValue >= ${minValue} && newValue <= ${maxValue}) {
                    setValue(newValue);
                }
            };

            return (
                <div className="range-slider">
                    <label htmlFor="${title.toLowerCase()}">${schema.title}</label>
                    <input
                        id="${title.toLowerCase()}"
                        type="range"
                        min={${minValue}}
                        max={${maxValue}}
                        step={${step}}
                        value={value}
                        onChange={handleInputChange}
                    />
                    ${showValue ? `<span>{value} ${unit}</span>` : ''}
                </div>
            );
        };

        export default ${title};
    `;
}
function generateStarRatingComponent(jsonData, title) {
    const { totalStars, initialRating, style } = jsonData;

    // Extract style properties
    const { starSize, starColor, emptyStarColor, textColor } = style;

    // Generate React component code
    return `
        import React, { useState } from 'react';
        import { FaStar } from 'react-icons/fa';

        const ${title} = () => {
            const [rating, setRating] = useState(${initialRating});

            const handleRatingChange = (newRating) => {
                setRating(newRating);
            };

            return (
                <div className="star-rating">
                    <h3 style={{ color: "${textColor}" }}>${jsonData.title}</h3>
                    {[...Array(${totalStars}).keys()].map((index) => (
                        <FaStar
                            key={index}
                            size="${starSize}"
                            color={rating >= index + 1 ? "${starColor}" : "${emptyStarColor}"}
                            onClick={() => handleRatingChange(index + 1)}
                            style={{ marginRight: '5px', cursor: 'pointer' }}
                        />
                    ))}
                    <p style={{ color: "${textColor}" }}>Current Rating: {rating}</p>
                </div>
            );
        };

        export default ${title};
    `;
}


function generateNavbarComponent(jsonData,title) {
    const { styles, links } = jsonData;
  
    const generateLinkCode = (link) => {
      if (link.type === "brand") {
        return `<div className="navbar-brand">${link.label}</div>`;
      } else {
        return `
          <li key="${link.label}">
            <NavLink to="${link.to}">${link.label}</NavLink>
          </li>
        `;
      }
    };
  
    const linkComponents = links.map(generateLinkCode).join("");
  
    const componentCode = `
      import React from 'react';
      import { NavLink } from 'react-router-dom';
  
      const ${title} = () => {
        return (
          <nav
            style={${JSON.stringify(styles)}}
            className="light-theme fixed"
          >
          <ul 
          style={${JSON.stringify(styles)}}
          >
            ${linkComponents}
            </ul>
          </nav>
        );
      };
  
      export default ${title};
    `;
  
    return componentCode;
}
  
   
  

  
  
  
  
  
  




module.exports.index =async function (req, res) {
 
    
    try {
        
        const response = req.body;
         
        const schema=JSON.parse(response.jsonSchema)
        console.log(schema )

        if (!schema.componentType) {
           
            throw new Error('Missing componentType in the request body.');
        }
        
        
        const generatedCode = generateReactComponentCode(schema, schema.componentType);
        console.log("generatedCode",generatedCode);
        

        //saving the generated react 
        try {
            // Create a new Code
            const newCode = new Code({ generatedCode });
            console.log('newCode', newCode);
            

            await newCode.save();
            console.log('code',newCode);
            
            // Add the new Code's ObjectId to the User's generatedCodes array
            req.user.generatedCodes.push(newCode._id);
            await req.user.save();
 
            res.status(201).json({ message: 'Code generated successfully',code:newCode });
          } catch (error) {
            res.status(400).json({ message: error.message });
          }


        // return res.status(200).json({ componentCode: reactComponentCode });
    } catch (err) {
        return res.status(420).json({ message: err.message });
    }
};
