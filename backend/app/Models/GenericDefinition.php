<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

/**
 * GenericDefinition represents a schema definition for generic resources.
 *
 * @property string $_id
 * @property string $_type Always 'definition'
 * @property string $type The resource type identifier
 * @property string $name Human-readable name
 * @property string $description Description of the definition
 * @property string $icon Icon identifier
 * @property string|null $parent Parent definition type
 * @property array $fields Map of field name to field schema
 */
class GenericDefinition extends Model
{
    protected $connection = 'mongodb';

    protected $table = 'generics';

    protected $primaryKey = '_id';

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        '_type',
        'type',
        'name',
        'description',
        'icon',
        'parent',
    ];

    /**
     * Scope to only get definitions.
     */
    public function scopeDefinitions($query)
    {
        return $query->where('_type', 'definition');
    }

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        // Always set _type to 'definition' when creating
        static::creating(function ($model) {
            $model->_type = 'definition';
        });
    }

    /**
     * Get field schema for a specific field.
     */
    public function getFieldSchema(string $fieldName): ?array
    {
        return $this->fields[$fieldName] ?? null;
    }

    /**
     * Get all field names.
     */
    public function getFieldNames(): array
    {
        return array_keys($this->fields ?? []);
    }
}
