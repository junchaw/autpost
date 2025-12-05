<?php

namespace App\Enums;

enum FieldType: string
{
    case ObjectId = 'oid';
    case String = 'string';
    case Text = 'text';
    case List = 'list';
    case Map = 'map';
    case URL = 'url';
    case Code = 'code';
    case Markdown = 'markdown';
    case Number = 'number';
    case Boolean = 'boolean';
    case Timestamp = 'timestamp';
    case Date = 'date';
    case Time = 'time';
    case Image = 'image';
    case ImageList = 'image_list';
    case File = 'file';
    case FileList = 'file_list';
    case Reference = 'reference';
    case FieldReference = 'field_reference';
    case FieldsReference = 'fields_reference';
    case ReferenceList = 'reference_list';
    case Location = 'location';

    public function label(): string
    {
        return match ($this) {
            self::ObjectId => 'ObjectID',
            self::String => 'String',
            self::Text => 'Text',
            self::List => 'List',
            self::Map => 'Map',
            self::URL => 'URL',
            self::Code => 'Code',
            self::Markdown => 'Markdown',
            self::Number => 'Number',
            self::Boolean => 'Boolean',
            self::Timestamp => 'Timestamp',
            self::Date => 'Date',
            self::Time => 'Time',
            self::Image => 'Image',
            self::ImageList => 'ImageList',
            self::File => 'File',
            self::FileList => 'FileList',
            self::Reference => 'Reference',
            self::FieldReference => 'FieldReference',
            self::FieldsReference => 'FieldsReference',
            self::ReferenceList => 'ReferenceList',
            self::Location => 'Location',
        };
    }

    public static function options(): array
    {
        return array_map(fn ($case) => [
            'value' => $case->value,
            'label' => $case->label(),
        ], self::cases());
    }
}
