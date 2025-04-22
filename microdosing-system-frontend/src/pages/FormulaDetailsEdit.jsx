import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Button,
  Typography,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import ArrowUpward from '@mui/icons-material/ArrowUpward';
import ArrowDownward from '@mui/icons-material/ArrowDownward';


const FormulaEditForm = () => {
  const { recipe_id } = useParams();
  const [recipe, setRecipe] = useState({
    name: "",
    code: "",
    description: "",
    version: "",
    status: "draft",
    no_of_materials: "",
    materials: [] // To hold recipe materials
  });

  const [storageOptions, setStorageOptions] = useState([]);

  const [materialNames, setMaterialNames] = useState({});

  const [selectedMaterialIds, setSelectedMaterialIds] = useState({});


  useEffect(() => {
    const fetchMaterialNames = async () => {
      const materialNamesObj = {}; // To store material names
  
      // Loop through each material to fetch its name
      for (let material of recipe.materials) {
        try {
          const response = await axios.get(`http://127.0.0.1:5000/api/materials/${material.material_id}`);
          materialNamesObj[material.material_id] = response.data.title; // Save the name by material_id
        } catch (error) {
          console.error('Error fetching material name:', error);
        }
      }
  
      setMaterialNames(materialNamesObj); // Update state with all material names
    };
  
    if (recipe.materials.length > 0) {
      fetchMaterialNames();
    }
  }, [recipe.materials]); // Depend on materials array
  
  useEffect(() => {
    const fetchMaterialNames = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:5000/api/materials");
        setStorageOptions(response.data);  // Store the material names in storageOptions
      } catch (error) {
        console.error("Error fetching material names:", error);
      }
    };
    fetchMaterialNames();
  }, []);
  

  // Fetch storage options from API
  useEffect(() => {
    const fetchStorageOptions = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:5000/api/materials");
        console.log("response :", response)
        setStorageOptions(response.data);  // Store the storage options
      } catch (error) {
        console.error("Error fetching storage options", error);
      }
    };

    fetchStorageOptions();
  }, []);

  const navigate = useNavigate();

  useEffect(() => {
    // Fetch recipe data
    axios
      .get(`http://127.0.0.1:5000/api/recipes/${recipe_id}`)
      .then((response) => {
        setRecipe((prev) => ({
          ...prev,
          ...response.data, // Merge the fetched recipe data
        }));
      })
      .catch((error) => {
        console.error("Error fetching recipe:", error);
      });

    // Fetch recipe materials by recipe_id
    axios
      .get(`http://127.0.0.1:5000/api/recipe_materials/${recipe_id}`)
      .then((response) => {
        setRecipe((prev) => ({
          ...prev,
          materials: response.data, // Set materials data for the recipe
        }));
      })
      .catch((error) => {
        console.error("Error fetching recipe materials:", error);
      });
  }, [recipe_id]);

  const handleChange = (e) => {
    setRecipe({ ...recipe, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      // Iterate through each material and send update request
      const updatePromises = recipe.materials.map((material) => {
        const { recipe_material_id, material_id, set_point, status } = material;
  
        return axios.put(`http://127.0.0.1:5000/api/recipe_materials/${recipe_material_id}`, {
          material_id,
          set_point,
          status,
        });
      });
  
      // Wait for all requests to complete
      await Promise.all(updatePromises);
  
      alert("All recipe materials updated successfully");
      navigate("/formula-details");
    } catch (error) {
      console.error("Error updating materials:", error);
      alert("Failed to update some or all materials.");
    }
  };
  

  const handleCancel = () => {
    navigate("/formula-details"); // Navigate to the recipe list page or wherever you'd like
  };


  const handleStatusChange = (materialId, newStatus) => {
    const updatedMaterials = recipe.materials.map((material) => {
      if (material.recipe_material_id === materialId) {
        return { ...material, status: newStatus };
      }
      return material;
    });

    // Update the recipe materials state with the new status (you could also send this to the backend here)
    // setRecipe({ ...recipe, materials: updatedMaterials });
    console.log(updatedMaterials); // For now, just log the updated data
  };
  

  return (
    <Paper elevation={3} sx={{ maxWidth: 900, margin: "auto", mt: 4, p: 3 }}>
      {/* <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Edit Formula</Typography>
        <IconButton
          onClick={handleCancel}
          sx={{
            border: '1px solid red',
            borderRadius: '50%',
            padding: '6px',
            height: '40px',
            width: '40px',
          }}
        >
          <CloseIcon sx={{ color: 'red' }} />
        </IconButton>
      </Box> */}

      {/* Recipe Data Form */}
      {/* <Box component="form" onSubmit={handleSubmit} noValidate autoComplete="off">
        <TextField
          fullWidth
          label="Name"
          name="name"
          value={recipe.name}
          onChange={handleChange}
          required
          margin="normal"
        />
        <TextField
          fullWidth
          label="Code"
          name="code"
          value={recipe.code}
          onChange={handleChange}
          required
          margin="normal"
        />
        <TextField
          fullWidth
          multiline
          rows={4}
          label="Description"
          name="description"
          value={recipe.description}
          onChange={handleChange}
          margin="normal"
        />
        <TextField
          fullWidth
          label="No of Materials"
          name="no_of_materials"
          type="number"
          value={recipe.no_of_materials}
          onChange={handleChange}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Version"
          name="version"
          value={recipe.version}
          onChange={handleChange}
          required
          margin="normal"
        />
        <FormControl fullWidth margin="normal">
          <InputLabel>Status</InputLabel>
          <Select
            name="status"
            value={recipe.status}
            onChange={handleChange}
            label="Status"
          >
            <MenuItem value="Released">Released</MenuItem>
            <MenuItem value="Unreleased">Unreleased</MenuItem>
          </Select>
        </FormControl>

        <Button variant="contained" type="submit" fullWidth sx={{ mt: 2 }}>
          Update Recipe
        </Button>
        <Button
          variant="outlined"
          onClick={handleCancel}
          fullWidth
          sx={{ mt: 2, marginTop : '12px' }}
        >
          Back
        </Button>
      </Box> */}

      {/* Recipe Materials Table */}
      <Box mt={4} p={3} sx={{ backgroundColor: "#f9f9f9", borderRadius: 2 }}>
        <Typography variant="h6" align="center" gutterBottom>
          Edit Formula
        </Typography>

        {recipe.materials.length > 0 ? (
          <Table sx={{ mt: 2, border: '1px solid #ccc', borderRadius: 1 }}>

            <TableHead sx={{ backgroundColor: '#d6dce5' }}>
              <TableRow>
                <TableCell><strong>Reorder</strong></TableCell>
                <TableCell><strong>Material</strong></TableCell>
                <TableCell><strong>Storage</strong></TableCell>
                <TableCell><strong>Set Point</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {recipe.materials.map((material) => (
                <TableRow key={material.recipe_material_id} hover>
                  {/* Reorder Placeholder */}
                  <TableCell>
                    {/* Optionally add icons like ↑ ↓ here */}
                    <IconButton size="small"><ArrowUpward fontSize="small" /></IconButton>
                    <IconButton size="small"><ArrowDownward fontSize="small" /></IconButton>
                  </TableCell>


                  {/* Material Dropdown */}
                  <TableCell>
                    <Select
                      fullWidth
                      value={selectedMaterialIds[material.material_id] || material.material_id}
                      onChange={(e) => {
                        const updatedMaterials = recipe.materials.map((mat) =>
                          mat.recipe_material_id === material.recipe_material_id
                            ? { ...mat, material_id: e.target.value }
                            : mat
                        );
                        setRecipe({ ...recipe, materials: updatedMaterials });
                      }}
                      size="small"
                    >
                      {storageOptions.map((matOpt) => (
                        <MenuItem key={matOpt.material_id} value={matOpt.material_id}>
                          {matOpt.title}
                        </MenuItem>
                      ))}
                    </Select>
                  </TableCell>

                   {/* Storage Dropdown */}
                   <TableCell>
                    <Select
                      fullWidth
                      value={material.storage || ''}
                      onChange={(e) => {
                        const updatedMaterials = recipe.materials.map((mat) =>
                          mat.recipe_material_id === material.recipe_material_id
                            ? { ...mat, storage: e.target.value }
                            : mat
                        );
                        setRecipe({ ...recipe, materials: updatedMaterials });
                      }}
                      displayEmpty
                      size="small"
                    >
                      <MenuItem value="" disabled>Select Storage</MenuItem>
                      {storageOptions.map((storage) => (
                        <MenuItem key={storage.id} value={storage.plant_area_location}>
                          {storage.plant_area_location}
                        </MenuItem>
                      ))}
                    </Select>
                  </TableCell>

                  {/* Set Point Input */}
                  <TableCell>
                    <TextField
                      fullWidth
                      type="number"
                      variant="outlined"
                      size="small"
                      value={material.set_point}
                      onChange={(e) => {
                        const updatedMaterials = recipe.materials.map((mat) =>
                          mat.recipe_material_id === material.recipe_material_id
                            ? { ...mat, set_point: e.target.value }
                            : mat
                        );
                        setRecipe({ ...recipe, materials: updatedMaterials });
                      }}
                    />
                  </TableCell>

                  {/* Status Dropdown */}
                  <TableCell>
                    <Select
                      fullWidth
                      value={material.status || ''}
                      onChange={(e) => {
                        const updatedMaterials = recipe.materials.map((mat) =>
                          mat.recipe_material_id === material.recipe_material_id
                            ? { ...mat, status: e.target.value }
                            : mat
                        );
                        setRecipe({ ...recipe, materials: updatedMaterials });
                      }}
                      size="small"
                    >
                      <MenuItem value="Released">Released</MenuItem>
                      <MenuItem value="Unreleased">Unreleased</MenuItem>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Typography>No materials available for this recipe.</Typography>
        )}

        {/* Action Buttons */}
        <Box mt={3} display="flex" justifyContent="space-between">
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
          >
            SAVE
          </Button>

          <Button
            variant="outlined"
            color="error"
            onClick={() => navigate(-1)}
          >
            CANCEL
          </Button>
        </Box>
      </Box>


    </Paper>
  );
};

export default FormulaEditForm;
