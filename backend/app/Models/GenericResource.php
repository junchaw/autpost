<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

/**
 * GenericResource represents a dynamic resource based on a definition.
 *
 * @property string $_id
 * @property string $_type The resource type (matches definition type)
 * @property array $data Dynamic data map based on definition schema
 */
class GenericResource extends Model
{
    protected $connection = 'mongodb';

    protected $table = 'generics';

    protected $primaryKey = '_id';

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        '_type',
    ];

    /**
     * Scope to get resources of a specific type.
     */
    public function scopeOfType($query, string $type)
    {
        return $query->where('_type', $type);
    }

    /**
     * Scope to exclude definitions.
     */
    public function scopeResources($query)
    {
        return $query->where('_type', '!=', 'definition');
    }

    /**
     * Get a specific data field value.
     */
    public function getDataField(string $fieldName): mixed
    {
        return $this->data[$fieldName] ?? null;
    }

    /**
     * Set a specific data field value.
     */
    public function setDataField(string $fieldName, mixed $value): void
    {
        $data = $this->data ?? [];
        $data[$fieldName] = $value;
        $this->data = $data;
    }

    /**
     * Get the definition for this resource.
     */
    public function getDefinition(): ?GenericDefinition
    {
        return GenericDefinition::definitions()
            ->where('type', $this->_type)
            ->first();
    }
}
